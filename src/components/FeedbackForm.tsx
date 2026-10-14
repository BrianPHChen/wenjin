import { useEffect, useRef, useState, type FormEvent } from 'react'
import { call, errorMessage, isInAppBrowser, lineEnabled, loginWithGoogle, loginWithLine, logout, resumeLineLogin, useUser } from '../auth'
import { CATEGORIES, MOOD_LABEL, MOODS, OTHER_VILLAGE, OTHER_VILLAGE_LABEL, TEXT_MAX, TEXT_MIN, type Category, type Mood } from '../data/feedback'
import { privacy } from '../data/privacy'
import { CONSENT_VERSION } from '../firebase'
import { villages } from '../geo'
import { MoodFace } from './MoodFace'
import '../form.css'

interface Props {
  defaultVillage: string | null
  onClose: () => void
}

interface SubmitReq {
  village: string
  category: Category
  mood: Mood
  text: string
  anonymous: boolean
  consentVersion: string
}

const submitFeedback = call<SubmitReq, { id: string }>('submitFeedback')
const chars = (s: string) => [...s.trim()].length

export default function FeedbackForm({ defaultVillage, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const user = useUser()
  const [resuming, setResuming] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    dialog.current?.showModal()
    setResuming(true)
    resumeLineLogin()
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setResuming(false))
  }, [])

  const run = async (fn: () => Promise<unknown>) => {
    setError('')
    setBusy(true)
    try {
      await fn()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  let body
  if (user === undefined || resuming) body = <p className="form-wait">確認登入狀態中…</p>
  else if (done) body = <Thanks onClose={onClose} onMore={() => setDone(false)} />
  else if (!user) body = <Notice busy={busy} onLogin={(fn) => run(fn)} />
  else
    body = (
      <Compose
        name={user.displayName}
        defaultVillage={defaultVillage}
        busy={busy}
        onLogout={() => run(logout)}
        onSubmit={(req) => run(async () => {
          await submitFeedback(req)
          setDone(true)
        })}
      />
    )

  return (
    <dialog ref={dialog} className="form-dialog" aria-labelledby="form-title" onClose={onClose}
      onClick={(e) => e.target === dialog.current && dialog.current.close()}>
      {/* 打開時把焦點放在對話框本身，手機上才不會在關閉鈕出現焦點框 */}
      <div className="form-inner" tabIndex={-1} autoFocus>
        <header className="form-head">
          <h2 id="form-title">我要反映</h2>
          <button type="button" className="form-x" aria-label="關閉" onClick={() => dialog.current?.close()}>×</button>
        </header>
        {body}
        {error && <p className="form-error" role="alert">{error}</p>}
      </div>
    </dialog>
  )
}

function Notice({ busy, onLogin }: { busy: boolean; onLogin: (fn: () => Promise<unknown>) => void }) {
  const [agreed, setAgreed] = useState(false)
  const google = !isInAppBrowser
  return (
    <div className="form-body">
      <p className="form-lede">為了避免灌水，留言前需要先登入。登入前請先閱讀以下說明：</p>
      <section className="notice" aria-label="個人資料蒐集告知">
        <h3>個人資料蒐集告知</h3>
        <dl>
          <dt>蒐集者</dt>
          <dd>{privacy.collector}</dd>
          <dt>目的</dt>
          <dd>確認留言者為真人、防止重複灌水、留言審核與匿名統計。不會用來寄送競選宣傳或提供給第三方。</dd>
          <dt>蒐集項目</dt>
          <dd>你的 LINE 或 Google 帳號識別碼與名稱（Google 登入另含 Email），以及你填寫的留言內容。</dd>
          <dt>匿名村民</dt>
          <dd>選擇匿名時，網站上不會顯示你的名稱；但審核人員仍看得到留言對應的帳號。</dd>
          <dt>保存期限</dt>
          <dd>{privacy.retention}。</dd>
          <dt>你的權利</dt>
          <dd>可隨時要求查詢、更正或刪除你的資料：{privacy.contact}。不提供資料將無法留言，但不影響瀏覽網站。</dd>
        </dl>
        <p className="notice-more">
          <a href="./privacy" target="_blank" rel="noreferrer">閱讀完整隱私權政策 →</a>
        </p>
      </section>
      <label className="agree">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        我已閱讀並同意上述個資蒐集說明
      </label>
      <div className="login-buttons">
        {lineEnabled && (
          <button type="button" className="btn btn-line" disabled={!agreed || busy} onClick={() => onLogin(loginWithLine)}>
            用 LINE 登入
          </button>
        )}
        {google && (
          <button type="button" className="btn btn-google" disabled={!agreed || busy} onClick={() => onLogin(loginWithGoogle)}>
            用 Google 登入
          </button>
        )}
      </div>
      {!google && (
        <p className="form-hint">
          {lineEnabled ? '想用 Google 登入的話，' : 'App 內建瀏覽器無法使用 Google 登入，'}
          請點右上角選單，選「用預設瀏覽器開啟」。
        </p>
      )}
      {!lineEnabled && google && <p className="form-hint">LINE 登入即將開放。</p>}
    </div>
  )
}

interface ComposeProps {
  name: string | null
  defaultVillage: string | null
  busy: boolean
  onLogout: () => void
  onSubmit: (req: SubmitReq) => void
}

function Compose({ name, defaultVillage, busy, onLogout, onSubmit }: ComposeProps) {
  const [village, setVillage] = useState(defaultVillage ?? '')
  const [category, setCategory] = useState<Category | ''>('')
  const [mood, setMood] = useState<Mood | ''>('')
  const [text, setText] = useState('')
  // 預設顯示帳號名稱，匿名是選項；帳號沒有名稱時只能匿名
  const [anonymous, setAnonymous] = useState(!name)
  const n = chars(text)
  const ready = village && category && mood && n >= TEXT_MIN && n <= TEXT_MAX

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (ready) onSubmit({ village, category, mood, text: text.trim(), anonymous, consentVersion: CONSENT_VERSION })
  }

  return (
    <form className="form-body" onSubmit={submit}>
      <p className="form-who">
        已登入：{name ?? '（未提供名稱）'}
        <button type="button" className="link" onClick={onLogout}>登出</button>
      </p>

      <label className="field">
        <span className="field-label">哪一村？</span>
        <select value={village} onChange={(e) => setVillage(e.target.value)} required>
          <option value="" disabled>請選擇</option>
          {villages.map((v) => <option key={v.code} value={v.code}>{v.name}</option>)}
          <option value={OTHER_VILLAGE}>{OTHER_VILLAGE_LABEL}</option>
        </select>
      </label>

      <fieldset className="field">
        <legend className="field-label">類別</legend>
        <div className="pick-row">
          {CATEGORIES.map((c) => (
            <label key={c} className={`pick${category === c ? ' is-on' : ''}`}>
              <input type="radio" name="category" value={c} checked={category === c} onChange={() => setCategory(c)} />
              {c === '其他' ? '其他／支持' : c}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="field">
        <legend className="field-label">心情</legend>
        <div className="pick-row">
          {MOODS.map((m) => (
            <label key={m} className={`pick pick-mood${mood === m ? ' is-on' : ''}`}>
              <input type="radio" name="mood" value={m} checked={mood === m} onChange={() => setMood(m)} />
              <MoodFace mood={m} />
              {MOOD_LABEL[m]}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span className="field-label">想說的話</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} maxLength={TEXT_MAX + 20}
          placeholder="例如：○○路口的路燈壞了好幾天，晚上很暗。" />
        <span className={`field-count${n > TEXT_MAX ? ' is-over' : ''}`}>{n} / {TEXT_MAX}</span>
      </label>

      <fieldset className="field">
        <legend className="field-label">留言板上顯示</legend>
        <div className="pick-row">
          <label className={`pick${!anonymous ? ' is-on' : ''}`}>
            <input type="radio" name="anon" checked={!anonymous} onChange={() => setAnonymous(false)} disabled={!name} />
            {name ?? '帳號名稱'}
          </label>
          <label className={`pick${anonymous ? ' is-on' : ''}`}>
            <input type="radio" name="anon" checked={anonymous} onChange={() => setAnonymous(true)} />
            匿名村民
          </label>
        </div>
      </fieldset>

      <p className="form-hint">送出後會先經過審核，通過後才會出現在留言板上。</p>
      <button type="submit" className="cta" disabled={!ready || busy}>{busy ? '送出中…' : '送出'}</button>
    </form>
  )
}

function Thanks({ onClose, onMore }: { onClose: () => void; onMore: () => void }) {
  return (
    <div className="form-body form-done">
      <p className="form-done-title">謝謝你的建言！</p>
      <p>審核通過後就會出現在留言板上。</p>
      <div className="login-buttons">
        <button type="button" className="cta" onClick={onClose}>回到網站</button>
        <button type="button" className="link" onClick={onMore}>再寫一則</button>
      </div>
    </div>
  )
}
