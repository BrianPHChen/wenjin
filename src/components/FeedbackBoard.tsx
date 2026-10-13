import { lazy, Suspense, useMemo, useState } from 'react'
import { CATEGORIES, type Category } from '../data/feedback'
import { useFeedback } from '../feedbackStore'
import { LINE_PENDING_KEY } from '../firebase'
import { villages } from '../geo'
import { MoodFace } from './MoodFace'

// 表單和登入 SDK 等按下「我要反映」才載入
const FeedbackForm = lazy(() => import('./FeedbackForm'))

const lineLoginPending = () => {
  try {
    return !!sessionStorage.getItem(LINE_PENDING_KEY)
  } catch {
    return false
  }
}

const villageName = Object.fromEntries(villages.map((v) => [v.code, v.name.replace('村', '')]))

interface Props {
  selected: string | null
  onSelect: (code: string | null) => void
}

export function FeedbackBoard({ selected, onSelect }: Props) {
  const [category, setCategory] = useState<Category | null>(null)
  // LINE 登入會整頁跳轉，回來時直接打開表單繼續
  const [formOpen, setFormOpen] = useState(lineLoginPending)
  const { items: feedback, status, hasMock } = useFeedback()

  const inVillage = useMemo(() => (selected ? feedback.filter((f) => f.village === selected) : feedback), [feedback, selected])
  const counts = useMemo(() => {
    const c = Object.fromEntries(CATEGORIES.map((k) => [k, 0])) as Record<Category, number>
    for (const f of inVillage) c[f.category]++
    return c
  }, [inVillage])
  const shown = category ? inVillage.filter((f) => f.category === category) : inVillage
  const where = selected ? `${villageName[selected]}村` : '壯圍'

  return (
    <section className="board" aria-labelledby="board-title">
      <header className="board-head">
        <h3 id="board-title">
          「{where}」的鄉親聲音
          {hasMock && <span className="badge">含示意留言</span>}
        </h3>
        <div className="chips" role="group" aria-label="依類別篩選">
          <button type="button" className={`chip${category === null ? ' is-on' : ''}`} aria-pressed={category === null} onClick={() => setCategory(null)}>
            全部 <span>{inVillage.length}</span>
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip${category === c ? ' is-on' : ''}`}
              aria-pressed={category === c}
              disabled={counts[c] === 0}
              onClick={() => setCategory(category === c ? null : c)}
            >
              {c} <span>{counts[c]}</span>
            </button>
          ))}
        </div>
      </header>

      <ol className="board-list" aria-live="polite">
        {shown.map((f, i) => (
          <li key={f.no} className={`note${i % 2 ? ' is-right' : ''}`}>
            <MoodFace mood={f.mood} />
            <div className="note-tags">
              <span className="tag tag-no">No.{f.no.toLocaleString()}</span>
              <button type="button" className="tag tag-village" onClick={() => onSelect(f.village)} title="在地圖上查看">
                {villageName[f.village]}
              </button>
              <span className="tag tag-cat">{f.category}</span>
            </div>
            <p>{f.text}</p>
            <span className="note-name">— {f.name ?? '匿名村民'}{f.mock && '（示意）'}</span>
          </li>
        ))}
        {status === 'loading' && <li className="board-empty">留言載入中…</li>}
        {status === 'error' && <li className="board-empty">留言載入失敗，請重新整理再試一次</li>}
        {status === 'ready' && shown.length === 0 && (
          <li className="board-empty">
            還沒有{where}{category ? `「${category}」類` : ''}的留言
            {selected && (
              <button type="button" className="link" onClick={() => onSelect(null)}>看全鄉留言</button>
            )}
          </li>
        )}
      </ol>

      <footer className="board-foot">
        <button type="button" className="cta" onClick={() => setFormOpen(true)}>你也有話想說？我要反映 →</button>
        {formOpen && (
          <Suspense fallback={null}>
            <FeedbackForm defaultVillage={selected} onClose={() => setFormOpen(false)} />
          </Suspense>
        )}
      </footer>
    </section>
  )
}
