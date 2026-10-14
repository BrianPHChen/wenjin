import { getDoc, setDoc } from 'firebase/firestore/lite'
import { useEffect, useState, type FormEvent } from 'react'
import { byNewest, parseInstagram, VIDEO_LIMIT, VIDEO_TITLE_MAX, type Video } from '../data/social'
import { videosDoc } from '../useVideos'

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 審核頁的「文進走透透」影片管理：貼上 IG Reel 網址就會出現在網站上，不用改程式 */
export function VideoManager({ onError }: { onError: (msg: string) => void }) {
  const [items, setItems] = useState<Video[] | null>(null)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(today)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getDoc(videosDoc)
      .then((d) => setItems(((d.data()?.items ?? []) as Video[]).sort(byNewest)))
      .catch((e) => {
        console.error(e)
        onError('讀取影片清單失敗')
        setItems([])
      })
  }, [onError])

  const save = async (next: Video[]) => {
    onError('')
    setBusy(true)
    try {
      const sorted = [...next].sort(byNewest)
      await setDoc(videosDoc, { items: sorted })
      setItems(sorted)
      return true
    } catch (e) {
      console.error(e)
      onError('儲存失敗：' + ((e as Error).message ?? ''))
      return false
    } finally {
      setBusy(false)
    }
  }

  const code = parseInstagram(url)
  const name = title.trim()
  const ready = !!code && name.length > 0 && [...name].length <= VIDEO_TITLE_MAX && !!date

  const add = async (e: FormEvent) => {
    e.preventDefault()
    if (!ready || !items) return
    if (await save([{ code: code!, title: name, date }, ...items.filter((v) => v.code !== code)])) {
      setUrl('')
      setTitle('')
      setDate(today())
    }
  }

  return (
    <section className="admin-tools card">
      <h2 className="card-label">文進走透透影片</h2>
      <p className="form-hint">
        貼上 Instagram Reel 網址（在 IG 按「⋯ → 複製連結」），網站會顯示日期最新的 {VIDEO_LIMIT} 支。
      </p>
      <form className="video-form" onSubmit={add}>
        <label className="field">
          <span className="field-label">Reel 網址</span>
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.instagram.com/reel/…" />
          {url && !code && <span className="field-count is-over">看起來不是 IG 貼文網址</span>}
        </label>
        <label className="field">
          <span className="field-label">標題（{[...name].length}/{VIDEO_TITLE_MAX}）</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：美福村關懷據點" />
        </label>
        <label className="field">
          <span className="field-label">日期</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <button type="submit" className="btn btn-approve" disabled={!ready || busy}>新增</button>
      </form>

      {items === null && <p className="form-wait">載入中…</p>}
      {items?.length === 0 && <p className="form-hint">還沒有影片。</p>}
      <ol className="video-admin-list">
        {items?.map((v, i) => (
          <li key={v.code} className={i < VIDEO_LIMIT ? '' : 'is-hidden'}>
            <span className="video-admin-date">{v.date}</span>
            <a href={`https://www.instagram.com/reel/${v.code}/`} target="_blank" rel="noreferrer">{v.title}</a>
            {i >= VIDEO_LIMIT && <span className="badge">未顯示</span>}
            <button type="button" className="link" disabled={busy}
              onClick={() => confirm(`刪除「${v.title}」？`) && save(items.filter((x) => x.code !== v.code))}>
              刪除
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}
