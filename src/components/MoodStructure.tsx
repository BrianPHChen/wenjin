import { useState } from 'react'
import { MOOD_LABEL, MOODS, type Mood } from '../data/feedback'
import type { FeedbackStats } from '../feedbackStats'

const pct = (n: number, d: number) => `${d ? ((n / d) * 100).toFixed(1) : '0.0'}%`

function Bar({ moods, title, thin }: { moods: Record<Mood, number>; title: string; thin?: boolean }) {
  const [hover, setHover] = useState<Mood | null>(null)
  const total = MOODS.reduce((s, m) => s + moods[m], 0)
  return (
    <div className={`age-row${thin ? ' is-thin' : ''}`}>
      <span className="age-row-title">{title}</span>
      <div className="age-bar" role="img" aria-label={`${title}情緒分布：${MOODS.map((m) => `${MOOD_LABEL[m]} ${pct(moods[m], total)}`).join('，')}`}>
        {MOODS.filter((m) => moods[m] > 0).map((m) => (
          <div
            key={m}
            className={`age-seg${hover && hover !== m ? ' is-dim' : ''}`}
            style={{ flexGrow: moods[m], background: `var(--mood-${m})` }}
            onPointerEnter={() => setHover(m)}
            onPointerLeave={() => setHover(null)}
          >
            {hover === m && (
              <span className="tooltip" role="tooltip">
                <strong>{MOOD_LABEL[m]}</strong>
                {moods[m]} 則 · {pct(moods[m], total)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function MoodStructure({ stats, township, name }: { stats: FeedbackStats; township: FeedbackStats; name: string }) {
  const isTownship = stats === township
  return (
    <section className="card age">
      <h3 className="card-label">鄉親情緒分布</h3>
      <Bar moods={stats.moods} title={name} />
      {!isTownship && <Bar moods={township.moods} title="全鄉" thin />}
      <ul className="legend">
        {MOODS.map((m) => (
          <li key={m}>
            <i style={{ background: `var(--mood-${m})` }} />
            <span className="legend-label">{MOOD_LABEL[m]}</span>
            <span className="legend-value">
              {stats.moods[m]} 則<em>{pct(stats.moods[m], stats.total)}</em>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
