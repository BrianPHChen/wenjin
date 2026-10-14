import { getDoc, setDoc } from 'firebase/firestore/lite'
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { byNewest, parseInstagram, VIDEO_LIMIT, VIDEO_TITLE_MAX, type Video } from '../data/social'
import { videosDoc } from '../useVideos'
import { deleteCover, makeCover, uploadCover } from './covers'

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
  // 新增影片時選的封面（已裁切壓縮），preview 是給畫面預覽用的暫時網址
  const [cover, setCover] = useState<{ blob: Blob; preview: string } | null>(null)

  useEffect(() => {
    getDoc(videosDoc)
      .then((d) => setItems(((d.data()?.items ?? []) as Video[]).sort(byNewest)))
      .catch((e) => {
        console.error(e)
        onError('讀取影片清單失敗')
        setItems([])
      })
  }, [onError])

  const pickCover = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const blob = await makeCover(file)
      if (cover) URL.revokeObjectURL(cover.preview)
      setCover({ blob, preview: URL.createObjectURL(blob) })
    } catch (err) {
      console.error(err)
      onError('這張圖片讀不出來，請換一張（建議用截圖的 PNG 或 JPG）')
    }
  }

  const save = async (next: Video[] | (() => Promise<Video[]>)) => {
    onError('')
    setBusy(true)
    try {
      const sorted = [...(typeof next === 'function' ? await next() : next)].sort(byNewest)
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
    const old = items.find((v) => v.code === code)
    const ok = await save(async () => {
      const coverUrl = cover ? await uploadCover(code!, cover.blob) : old?.cover
      const video: Video = { code: code!, title: name, date, ...(coverUrl ? { cover: coverUrl } : {}) }
      return [video, ...items.filter((v) => v.code !== code)]
    })
    if (ok) {
      if (cover && old?.cover) deleteCover(old.cover)
      setUrl('')
      setTitle('')
      setDate(today())
      if (cover) URL.revokeObjectURL(cover.preview)
      setCover(null)
    }
  }

  /** 幫已經在清單裡的影片加上或更換封面 */
  const replaceCover = async (v: Video, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !items) return
    const ok = await save(async () => {
      const coverUrl = await uploadCover(v.code, await makeCover(file))
      return items.map((x) => (x.code === v.code ? { ...x, cover: coverUrl } : x))
    })
    if (ok) deleteCover(v.cover)
  }

  const remove = async (v: Video) => {
    if (!items || !confirm(`刪除「${v.title}」？`)) return
    if (await save(items.filter((x) => x.code !== v.code))) deleteCover(v.cover)
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
        <label className="field cover-field">
          <span className="field-label">封面（選填）</span>
          <span className="cover-pick">
            {cover ? <img src={cover.preview} alt="封面預覽" /> : <span className="cover-empty">＋</span>}
            <input type="file" accept="image/*" onChange={pickCover} />
          </span>
        </label>
        <button type="submit" className="btn btn-approve" disabled={!ready || busy}>{busy ? '儲存中…' : '新增'}</button>
      </form>
      <p className="form-hint">封面用 Reel 截圖就好（長按影片暫停再截圖），會自動裁成直式並壓縮；沒有封面會顯示彩色卡片。</p>

      {items === null && <p className="form-wait">載入中…</p>}
      {items?.length === 0 && <p className="form-hint">還沒有影片。</p>}
      <ol className="video-admin-list">
        {items?.map((v, i) => (
          <li key={v.code} className={i < VIDEO_LIMIT ? '' : 'is-hidden'}>
            {v.cover ? <img className="video-admin-cover" src={v.cover} alt="" /> : <span className="video-admin-cover" />}
            <span className="video-admin-date">{v.date}</span>
            <a href={`https://www.instagram.com/reel/${v.code}/`} target="_blank" rel="noreferrer">{v.title}</a>
            {i >= VIDEO_LIMIT && <span className="badge">未顯示</span>}
            <label className={`link cover-replace${busy ? ' is-disabled' : ''}`}>
              {v.cover ? '換封面' : '加封面'}
              <input type="file" accept="image/*" disabled={busy} onChange={(e) => replaceCover(v, e)} />
            </label>
            <button type="button" className="link" disabled={busy} onClick={() => remove(v)}>
              刪除
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}
