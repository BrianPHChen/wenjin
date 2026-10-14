// 審核頁：網址加 #/admin。只有 admins/{uid} 文件存在的帳號能看到留言和操作。

import { collection, doc, getDoc, getDocs, limit, orderBy, query, Timestamp, where } from 'firebase/firestore/lite'
import { useCallback, useEffect, useState } from 'react'
import { call, errorMessage, isInAppBrowser, lineEnabled, loginWithGoogle, loginWithLine, logout, resumeLineLogin, useUser } from '../auth'
import { MOOD_LABEL, OTHER_VILLAGE, OTHER_VILLAGE_LABEL, type Category, type Mood } from '../data/feedback'
import { db } from '../firebase'
import { villages } from '../geo'
import { MoodFace } from '../components/MoodFace'
import { VideoManager } from './VideoManager'
import '../form.css'
import './admin.css'

type Status = 'pending' | 'approved' | 'rejected'
const TABS: { status: Status; label: string }[] = [
  { status: 'pending', label: '待審核' },
  { status: 'approved', label: '已通過' },
  { status: 'rejected', label: '已退回' },
]

interface Row {
  id: string
  village: string
  category: Category
  mood: Mood
  text: string
  displayName: string | null
  accountName: string | null
  provider: string
  uid: string | null
  isMock: boolean
  no: number | null
  createdAt: Timestamp
}

const villageName: Record<string, string> = { ...Object.fromEntries(villages.map((v) => [v.code, v.name])), [OTHER_VILLAGE]: OTHER_VILLAGE_LABEL }
const review = call<{ id: string; action: 'approve' | 'reject' | 'pending' }, unknown>('reviewFeedback')
const seed = call<{ items: unknown[] }, { count: number }>('seedMockFeedback')
const clearMock = call<void, { removed: number }>('clearMockFeedback')
const rebuild = call<void, { count: number }>('rebuildPublicFeed')

export default function Admin() {
  const user = useUser()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    resumeLineLogin().catch((e) => setError(errorMessage(e)))
  }, [])

  useEffect(() => {
    setIsAdmin(null)
    if (!user) return
    getDoc(doc(db, 'admins', user.uid))
      .then((d) => setIsAdmin(d.exists()))
      .catch(() => setIsAdmin(false))
  }, [user])

  const login = (fn: () => Promise<unknown>) => fn().catch((e) => setError(errorMessage(e)))

  let body
  if (user === undefined) body = <p className="form-wait">確認登入狀態中…</p>
  else if (!user)
    body = (
      <div className="admin-login login-buttons">
        <p>請用管理員帳號登入。</p>
        {lineEnabled && <button type="button" className="btn btn-line" onClick={() => login(loginWithLine)}>用 LINE 登入</button>}
        {!isInAppBrowser && <button type="button" className="btn btn-google" onClick={() => login(loginWithGoogle)}>用 Google 登入</button>}
      </div>
    )
  else if (isAdmin === null) body = <p className="form-wait">確認權限中…</p>
  else if (!isAdmin)
    body = (
      <div className="admin-denied">
        <p>這個帳號還不是管理員。</p>
        <p>
          請到 Firebase 主控台 → Firestore → 新增集合 <code>admins</code>，文件 ID 填下面這串，欄位隨意（例如 <code>name</code>：你的名字），存檔後重新整理。
        </p>
        <p className="admin-uid">
          <code>{user.uid}</code>
          <button type="button" className="link" onClick={() => navigator.clipboard?.writeText(user.uid)}>複製</button>
        </p>
      </div>
    )
  else body = <Review onError={setError} />

  return (
    <div className="page admin">
      <header className="admin-head">
        <h1>鄉親建言審核</h1>
        {user && (
          <p>
            {user.displayName ?? user.email ?? user.uid}
            <button type="button" className="link" onClick={() => logout()}>登出</button>
            <a className="link" href="./">回到網站</a>
          </p>
        )}
      </header>
      {error && <p className="form-error" role="alert">{error}</p>}
      {body}
    </div>
  )
}

function Review({ onError }: { onError: (msg: string) => void }) {
  const [tab, setTab] = useState<Status>('pending')
  const [rows, setRows] = useState<Row[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    setRows(null)
    try {
      const q = query(collection(db, 'feedback'), where('status', '==', tab), orderBy('createdAt', 'desc'), limit(300))
      const snap = await getDocs(q)
      setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Row))
    } catch (e) {
      console.error(e)
      onError('讀取留言失敗：' + ((e as Error).message ?? ''))
      setRows([])
    }
  }, [tab, onError])

  useEffect(() => {
    load()
  }, [load])

  const act = async (key: string, fn: () => Promise<unknown>, reload = true) => {
    onError('')
    setBusy(key)
    try {
      await fn()
      if (reload) await load()
    } catch (e) {
      onError(errorMessage(e))
    } finally {
      setBusy(null)
    }
  }

  const decide = (id: string, action: 'approve' | 'reject' | 'pending') =>
    act(id, async () => {
      await review({ id, action })
      setRows((r) => r?.filter((x) => x.id !== id) ?? r)
    }, false)

  return (
    <>
      <nav className="admin-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.status} type="button" role="tab" aria-selected={tab === t.status}
            className={`pick${tab === t.status ? ' is-on' : ''}`} onClick={() => setTab(t.status)}>
            {t.label}{tab === t.status && rows ? ` ${rows.length}${rows.length === 300 ? '+' : ''}` : ''}
          </button>
        ))}
        <button type="button" className="link" onClick={load}>重新整理</button>
      </nav>

      {rows === null && <p className="form-wait">載入中…</p>}
      {rows?.length === 0 && <p className="form-wait">沒有{TABS.find((t) => t.status === tab)!.label}的留言</p>}
      <ol className="admin-list">
        {rows?.map((r) => (
          <li key={r.id} className="admin-item">
            <div className="admin-meta">
              <MoodFace mood={r.mood} />
              <span className="tag tag-village">{villageName[r.village] ?? r.village}</span>
              <span className="tag tag-cat">{r.category}</span>
              <span className="admin-mood">{MOOD_LABEL[r.mood]}</span>
              {r.no != null && <span className="tag tag-no">No.{r.no}</span>}
              {r.isMock && <span className="badge">示意</span>}
            </div>
            <p className="admin-text">{r.text}</p>
            <p className="admin-who">
              公開顯示：{r.displayName ?? '匿名村民'}
              {!r.isMock && <> · 帳號：{r.accountName ?? '（無名稱）'}（{r.provider}）</>}
              {' · '}{r.createdAt.toDate().toLocaleString('zh-TW', { hour12: false })}
            </p>
            <div className="admin-actions">
              {tab !== 'approved' && (
                <button type="button" className="btn btn-approve" disabled={!!busy} onClick={() => decide(r.id, 'approve')}>通過</button>
              )}
              {tab !== 'rejected' && (
                <button type="button" className="btn btn-reject" disabled={!!busy} onClick={() => decide(r.id, 'reject')}>
                  {tab === 'approved' ? '撤下' : '退回'}
                </button>
              )}
              {tab !== 'pending' && (
                <button type="button" className="link" disabled={!!busy} onClick={() => decide(r.id, 'pending')}>改回待審核</button>
              )}
            </div>
          </li>
        ))}
      </ol>

      <VideoManager onError={onError} />

      <section className="admin-tools card">
        <h2 className="card-label">示意資料與維護</h2>
        <p className="form-hint">示意資料（isMock = true）在網站上看起來和真實留言一樣，不會標示「示意」。正式上線前請清除。</p>
        <div className="admin-actions">
          <button type="button" className="btn btn-google" disabled={!!busy}
            onClick={() => act('seed', async () => {
              const { mockFeedback } = await import('../data/mockFeedback')
              const { count } = await seed({ items: mockFeedback })
              alert(`已匯入，網站現在共有 ${count} 則公開留言`)
            })}>
            匯入示意資料
          </button>
          <button type="button" className="btn btn-reject" disabled={!!busy}
            onClick={() => confirm('確定要刪除全部示意資料？') && act('clear', async () => {
              const { removed } = await clearMock()
              alert(`已刪除 ${removed} 則示意資料`)
            })}>
            清除示意資料
          </button>
          <button type="button" className="link" disabled={!!busy}
            onClick={() => act('rebuild', async () => {
              const { count } = await rebuild()
              alert(`已重建公開資料，共 ${count} 則`)
            })}>
            重建公開資料
          </button>
        </div>
        {busy && ['seed', 'clear', 'rebuild'].includes(busy) && <p className="form-wait">處理中…</p>}
      </section>
    </>
  )
}
