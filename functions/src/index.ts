// 鄉親建言後端。所有寫入都經過這裡（Firestore 規則禁止前端直接寫），
// 公開資料只放在 publicFeed：審核通過的留言、只含可公開欄位，前端一次讀幾份文件就有全部資料。

import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { setGlobalOptions } from 'firebase-functions/v2'
import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/v2/https'
import { defineString } from 'firebase-functions/params'

initializeApp()
setGlobalOptions({ region: 'asia-east1', maxInstances: 10 })
const db = getFirestore()

const LINE_CHANNEL_ID = defineString('LINE_CHANNEL_ID', { default: '' })

// 要跟前端 src/data/feedback.ts、src/firebase.ts 一致
const VILLAGES = new Set([
  '10002060001', '10002060002', '10002060003', '10002060004', '10002060005', '10002060006', '10002060007', '10002060009',
  '10002060010', '10002060011', '10002060012', '10002060013', '10002060014', '10002060015', '10002060016', '10002060017',
])
const CATEGORIES = new Set(['交通', '環境', '長照', '育兒', '觀光', '文化', '其他'])
const MOODS = new Set(['angry', 'worried', 'neutral', 'happy'])
const CONSENT_VERSION = '2026-10-13'
const TEXT_MIN = 5
const TEXT_MAX = 300
const POST_INTERVAL_MS = 10 * 60 * 1000
/** Firestore 單一文件上限 1 MiB，留點餘裕 */
const CHUNK_BYTES = 700_000

interface PublicItem {
  id: string
  no: number
  village: string
  category: string
  mood: string
  text: string
  /** null = 匿名村民 */
  name: string | null
  at: number
  mock?: true
}

const publicFeed = () => db.collection('publicFeed')
const chunkRef = (n: number) => publicFeed().doc(String(n).padStart(3, '0'))
const metaRef = db.doc('config/feed')
const bytes = (items: PublicItem[]) => Buffer.byteLength(JSON.stringify(items))
const chars = (s: string) => [...s].length

function toItem(id: string, f: FirebaseFirestore.DocumentData): PublicItem {
  return {
    id,
    no: f.no,
    village: f.village,
    category: f.category,
    mood: f.mood,
    text: f.text,
    name: f.displayName ?? null,
    at: (f.createdAt as Timestamp).toMillis(),
    ...(f.isMock ? { mock: true as const } : {}),
  }
}

function checkFields(d: Record<string, unknown>) {
  const text = typeof d.text === 'string' ? d.text.trim() : ''
  if (!VILLAGES.has(d.village as string)) throw new HttpsError('invalid-argument', '請選擇村')
  if (!CATEGORIES.has(d.category as string)) throw new HttpsError('invalid-argument', '請選擇類別')
  if (!MOODS.has(d.mood as string)) throw new HttpsError('invalid-argument', '請選擇心情')
  if (chars(text) < TEXT_MIN || chars(text) > TEXT_MAX)
    throw new HttpsError('invalid-argument', `內容請寫 ${TEXT_MIN}–${TEXT_MAX} 個字`)
  return { village: d.village as string, category: d.category as string, mood: d.mood as string, text }
}

async function requireAdmin(req: CallableRequest) {
  const uid = req.auth?.uid
  if (!uid || !(await db.doc(`admins/${uid}`).get()).exists) throw new HttpsError('permission-denied', '只有管理員可以操作')
}

/** LINE 登入：驗證 LIFF 拿到的 ID token，換成 Firebase 自訂登入憑證（uid = line:Uxxxx） */
export const lineLogin = onCall(async (req) => {
  const channelId = LINE_CHANNEL_ID.value()
  if (!channelId) throw new HttpsError('failed-precondition', 'LINE 登入尚未設定')
  const idToken = req.data?.idToken
  if (typeof idToken !== 'string' || !idToken) throw new HttpsError('invalid-argument', '缺少 LINE 憑證')

  const res = await fetch('https://api.line.me/oauth2/v2.1/verify', {
    method: 'POST',
    body: new URLSearchParams({ id_token: idToken, client_id: channelId }),
  })
  if (!res.ok) throw new HttpsError('unauthenticated', 'LINE 憑證無效，請重新登入')
  const profile = (await res.json()) as { sub: string; name?: string }

  const uid = `line:${profile.sub}`
  const update = profile.name ? { displayName: profile.name.slice(0, 50) } : {}
  const auth = getAuth()
  try {
    await auth.updateUser(uid, update)
  } catch (e) {
    if ((e as { code?: string }).code !== 'auth/user-not-found') throw e
    await auth.createUser({ uid, ...update })
  }
  return { token: await auth.createCustomToken(uid) }
})

/** 鄉親送出建言：一律進待審核 */
export const submitFeedback = onCall(async (req) => {
  const uid = req.auth?.uid
  if (!uid) throw new HttpsError('unauthenticated', '請先登入')
  const d = (req.data ?? {}) as Record<string, unknown>
  if (d.consentVersion !== CONSENT_VERSION) throw new HttpsError('failed-precondition', '請先閱讀並同意個資告知')
  const fields = checkFields(d)

  const user = await getAuth().getUser(uid)
  const accountName = user.displayName?.slice(0, 50) || null
  const provider = uid.startsWith('line:') ? 'line' : (req.auth!.token.firebase?.sign_in_provider ?? 'unknown')
  const userRef = db.doc(`users/${uid}`)

  return db.runTransaction(async (tx) => {
    const u = (await tx.get(userRef)).data()
    const wait = (u?.lastPostAt?.toMillis() ?? 0) + POST_INTERVAL_MS - Date.now()
    if (wait > 0) throw new HttpsError('resource-exhausted', `留言太頻繁了，請 ${Math.ceil(wait / 60000)} 分鐘後再試`)

    const now = Timestamp.now()
    const ref = db.collection('feedback').doc()
    tx.set(ref, {
      ...fields,
      // 公開顯示的名稱；選匿名就是 null，但審核時仍看得到 accountName
      displayName: d.anonymous === true ? null : accountName,
      accountName,
      uid,
      provider,
      status: 'pending',
      isMock: false,
      no: null,
      createdAt: now,
      reviewedAt: null,
    })
    tx.set(
      userRef,
      {
        provider,
        lastPostAt: now,
        consentVersion: CONSENT_VERSION,
        consentAt: u?.consentVersion === CONSENT_VERSION ? u.consentAt : now,
      },
      { merge: true },
    )
    return { id: ref.id }
  })
})

/** 審核：approve 會編號並公開；reject / pending 會從公開資料撤下 */
export const reviewFeedback = onCall(async (req) => {
  await requireAdmin(req)
  const { id, action } = (req.data ?? {}) as { id?: string; action?: string }
  if (typeof id !== 'string' || !['approve', 'reject', 'pending'].includes(action ?? ''))
    throw new HttpsError('invalid-argument', '參數錯誤')
  const ref = db.doc(`feedback/${id}`)

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists) throw new HttpsError('not-found', '找不到這則留言')
    const f = snap.data()!
    const now = Timestamp.now()

    if (action === 'approve') {
      if (f.status === 'approved') return { no: f.no }
      const meta = (await tx.get(metaRef)).data() ?? { nextNo: 1, chunk: 0 }
      const last = await tx.get(chunkRef(meta.chunk))
      const no: number = f.no ?? meta.nextNo
      const item = toItem(id, { ...f, no })
      const items = [...((last.data()?.items as PublicItem[]) ?? []), item]
      let chunk = meta.chunk
      if (items.length > 1 && bytes(items) > CHUNK_BYTES) tx.set(chunkRef(++chunk), { items: [item] })
      else tx.set(chunkRef(chunk), { items })
      tx.set(metaRef, { nextNo: f.no ? meta.nextNo : meta.nextNo + 1, chunk }, { merge: true })
      tx.update(ref, { status: 'approved', no, reviewedAt: now })
      return { no }
    }

    if (f.status === 'approved') {
      const chunks = await tx.get(publicFeed())
      for (const c of chunks.docs) {
        const items = c.data().items as PublicItem[]
        if (items.some((i) => i.id === id)) tx.update(c.ref, { items: items.filter((i) => i.id !== id) })
      }
    }
    tx.update(ref, { status: action === 'reject' ? 'rejected' : 'pending', reviewedAt: now })
    return {}
  })
})

/** 依 feedback 裡所有已通過的留言重建 publicFeed（匯入／清除示意資料後、或資料不一致時用） */
async function rebuildFeed() {
  const approved = await db.collection('feedback').where('status', '==', 'approved').get()
  const items = approved.docs.map((d) => toItem(d.id, d.data())).sort((a, b) => b.at - a.at)
  const chunks: PublicItem[][] = [[]]
  for (const item of items) {
    const cur = chunks[chunks.length - 1]
    if (cur.length && bytes([...cur, item]) > CHUNK_BYTES) chunks.push([item])
    else cur.push(item)
  }
  const old = await publicFeed().get()
  const meta = (await metaRef.get()).data()
  const batch = db.batch()
  old.docs.forEach((d) => batch.delete(d.ref))
  chunks.forEach((c, n) => batch.set(chunkRef(n), { items: c }))
  const realNos = items.filter((i) => !i.mock).map((i) => i.no)
  // 撤下的留言保留原編號，所以 nextNo 只增不減
  batch.set(metaRef, { chunk: chunks.length - 1, nextNo: Math.max(meta?.nextNo ?? 1, ...realNos.map((n) => n + 1)) })
  await batch.commit()
  return items.length
}

export const rebuildPublicFeed = onCall(async (req) => {
  await requireAdmin(req)
  return { count: await rebuildFeed() }
})

/** 匯入示意留言（前端傳入 src/data/mockFeedback.ts），直接標成已通過、isMock = true */
export const seedMockFeedback = onCall({ timeoutSeconds: 120 }, async (req) => {
  await requireAdmin(req)
  const list = req.data?.items
  if (!Array.isArray(list) || list.length === 0 || list.length > 1000) throw new HttpsError('invalid-argument', '資料格式錯誤')
  const existing = await db.collection('feedback').where('isMock', '==', true).limit(1).get()
  if (!existing.empty) throw new HttpsError('already-exists', '已經匯入過示意資料，請先清除')

  // 列表是新到舊；時間往回每則間隔 3 小時，讓排序跟原本一樣
  const base = Date.now()
  for (let start = 0; start < list.length; start += 400) {
    const batch = db.batch()
    list.slice(start, start + 400).forEach((raw: Record<string, unknown>, k: number) => {
      const fields = checkFields(raw)
      const at = Timestamp.fromMillis(base - (start + k) * 3 * 3600 * 1000)
      batch.set(db.collection('feedback').doc(), {
        ...fields,
        displayName: null,
        accountName: null,
        uid: null,
        provider: 'mock',
        status: 'approved',
        isMock: true,
        no: Number(raw.no) || null,
        createdAt: at,
        reviewedAt: at,
      })
    })
    await batch.commit()
  }
  return { count: await rebuildFeed() }
})

export const clearMockFeedback = onCall({ timeoutSeconds: 120 }, async (req) => {
  await requireAdmin(req)
  const mocks = await db.collection('feedback').where('isMock', '==', true).get()
  for (let start = 0; start < mocks.size; start += 400) {
    const batch = db.batch()
    mocks.docs.slice(start, start + 400).forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }
  return { removed: mocks.size, count: await rebuildFeed() }
})
