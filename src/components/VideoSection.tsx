import { useEffect, useRef, useState } from 'react'
import { SOCIAL, VIDEO_LIMIT, type Video } from '../data/social'
import { MAP_HEIGHT, MAP_WIDTH, townshipD } from '../geo'
import { useVideos } from '../useVideos'
import { FacebookIcon, InstagramIcon } from './SocialIcons'

const TONES = ['young', 'work', 'old'] as const

function formatDate(date: string) {
  const [, m, d] = date.split('-').map(Number)
  return m && d ? `${m}/${d}` : date
}

/** 文進走透透：最新幾支 IG Reels。先顯示封面卡，點了才載入 Instagram（網頁比較快，也不會先被 Meta 追蹤） */
export function VideoSection() {
  const videos = useVideos()
  const [playing, setPlaying] = useState<Video | null>(null)
  const shown = videos?.slice(0, VIDEO_LIMIT) ?? []

  return (
    <section className="videos" id="videos" aria-labelledby="videos-title">
      <header className="videos-head">
        <p className="eyebrow">影音</p>
        <h2 id="videos-title">文進走透透</h2>
      </header>

      {videos && shown.length === 0 && <p className="videos-empty">影片整理中，先到 Instagram 看看文進最近跑了哪些村！</p>}
      {shown.length > 0 && (
        <ol className="video-row">
          {shown.map((v, i) => (
            <li key={v.code}>
              <button type="button" className={`video-card tone-${TONES[i % TONES.length]}${v.cover ? ' has-cover' : ''}`}
                onClick={() => setPlaying(v)}>
                {v.cover ? (
                  <img className="video-cover" src={v.cover} alt="" loading="lazy" decoding="async" />
                ) : (
                  <svg className="video-mark" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} aria-hidden="true">
                    <path d={townshipD} />
                  </svg>
                )}
                <span className="video-top">
                  <InstagramIcon />
                  Reels
                </span>
                <span className="video-play" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5Z" /></svg>
                </span>
                <span className="video-title">{v.title}</span>
                <span className="video-date">{formatDate(v.date)}</span>
              </button>
            </li>
          ))}
        </ol>
      )}

      <div className="videos-follow">
        <a className="follow follow-ig" href={SOCIAL.instagram} target="_blank" rel="noreferrer">
          <InstagramIcon />
          到 Instagram 看更多
        </a>
        <a className="follow follow-fb" href={SOCIAL.facebook} target="_blank" rel="noreferrer">
          <FacebookIcon />
          追蹤 Facebook 粉專
        </a>
      </div>

      {playing && <Player video={playing} onClose={() => setPlaying(null)} />}
    </section>
  )
}

function Player({ video, onClose }: { video: Video; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => dialog.current?.showModal(), [])
  const url = `https://www.instagram.com/reel/${video.code}/`
  return (
    <dialog ref={dialog} className="player" aria-label={video.title} onClose={onClose}
      onClick={(e) => e.target === dialog.current && dialog.current.close()}>
      <div className="player-inner" tabIndex={-1} autoFocus>
        <header className="player-head">
          <strong>{video.title}</strong>
          <button type="button" className="player-x" aria-label="關閉" onClick={() => dialog.current?.close()}>×</button>
        </header>
        <iframe src={`https://www.instagram.com/p/${video.code}/embed/`} title={video.title}
          allow="autoplay; encrypted-media; picture-in-picture; web-share" allowFullScreen />
        <a className="player-link" href={url} target="_blank" rel="noreferrer">在 Instagram 開啟 →</a>
      </div>
    </dialog>
  )
}
