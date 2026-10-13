import { policies } from '../data/policies'
import type { FeedbackStats } from '../feedbackStats'
import { StatCard } from './StatCard'
import { TextStat } from './TextStat'

const pct = (x: number) => `${(x * 100).toFixed(0)}%`

interface Props {
  stats: FeedbackStats
  township: FeedbackStats
  isVillage: boolean
}

export function InsightPanel({ stats: s, township: T, isVillage }: Props) {
  const top3 = s.issues.slice(0, 3).filter((i) => i.count > 0)
  const max = top3[0]?.count ?? 1
  const issueTotal = s.total - s.support
  const top = s.issues[0]

  return (
    <div className="insights">
      <div className="stats-grid">
        <StatCard label="總建言數" value={s.total} unit="則"
          note={isVillage ? `佔全鄉 ${pct(s.total / T.total)}` : `來自 ${s.villageCount} 個村`} />
        <StatCard label="支持留言" value={s.support} unit="則"
          note={s.total ? `佔 ${pct(s.support / s.total)}` : '—'} />
        <TextStat label="最多關注議題" value={s.topIssue ?? '—'}
          note={top?.count ? `${top.count} 則 · 議題中佔 ${pct(top.share)}` : '尚無議題留言'} />
        <TextStat label="鄉親最擔心" value={s.topConcern ?? '—'}
          note={s.topConcern ? `${s.topConcernCount} 則表達生氣或擔心` : '沒有負面留言'} />
      </div>

      <section className="card top-issues" aria-labelledby="top-issues-title">
        <h3 className="card-label" id="top-issues-title">三大關注議題</h3>
        {top3.length === 0 && <p className="stat-note">尚無議題留言</p>}
        <ol>
          {top3.map((i, rank) => {
            const policyIndex = policies.findIndex((p) => p.issue === i.issue)
            return (
              <li key={i.issue}>
                <div className="ti-row">
                  <span className="ti-rank">{rank + 1}</span>
                  <span className="ti-name">{i.issue}</span>
                  <span className="ti-bar" aria-hidden="true">
                    <i style={{ width: `${(i.count / max) * 100}%` }} />
                  </span>
                  <span className="ti-value">
                    {i.count} 則<em>{pct(i.count / issueTotal)}</em>
                  </span>
                </div>
                {policyIndex >= 0 && (
                  <a className="ti-policy" href={`#policy-${policyIndex + 1}`}>
                    對應政見：{policies[policyIndex].title} →
                  </a>
                )}
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
