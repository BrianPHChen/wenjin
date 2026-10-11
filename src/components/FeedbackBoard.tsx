import { useMemo, useState } from 'react'
import { CATEGORIES, feedback, FEEDBACK_FORM_URL, FEEDBACK_PLACEHOLDER, type Category, type Mood } from '../data/feedback'
import { villages } from '../geo'

const villageName = Object.fromEntries(villages.map((v) => [v.code, v.name.replace('村', '')]))

function MoodFace({ mood }: { mood: Mood }) {
  const mouth = {
    angry: 'M8 16.5 Q12 13.5 16 16.5',
    worried: 'M8.5 16 Q12 14.5 15.5 16',
    neutral: 'M8.5 15.5 H15.5',
    happy: 'M8 14 Q12 18 16 14',
  }[mood]
  const label = { angry: '生氣', worried: '擔心', neutral: '普通', happy: '開心' }[mood]
  return (
    <span className={`mood mood-${mood}`} role="img" aria-label={label}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {mood === 'angry' && <path d="M6.5 8.5 L10 10 M17.5 8.5 L14 10" />}
        <circle cx="9" cy="11.5" r="1.1" />
        <circle cx="15" cy="11.5" r="1.1" />
        <path d={mouth} />
      </svg>
    </span>
  )
}

interface Props {
  selected: string | null
  onSelect: (code: string | null) => void
}

export function FeedbackBoard({ selected, onSelect }: Props) {
  const [category, setCategory] = useState<Category | null>(null)

  const inVillage = useMemo(() => (selected ? feedback.filter((f) => f.village === selected) : feedback), [selected])
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
          {FEEDBACK_PLACEHOLDER && <span className="badge">示意留言</span>}
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
          </li>
        ))}
        {shown.length === 0 && (
          <li className="board-empty">
            還沒有{where}{category ? `「${category}」類` : ''}的留言
            {selected && (
              <button type="button" className="link" onClick={() => onSelect(null)}>看全鄉留言</button>
            )}
          </li>
        )}
      </ol>

      <footer className="board-foot">
        {FEEDBACK_FORM_URL ? (
          <a className="cta" href={FEEDBACK_FORM_URL} target="_blank" rel="noreferrer">你也有話想說？我要反映 →</a>
        ) : (
          <span className="cta is-disabled" aria-disabled="true">我要反映（即將開放）</span>
        )}
      </footer>
    </section>
  )
}
