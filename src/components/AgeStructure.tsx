import { useState } from 'react'
import type { DerivedStats } from '../stats'

const GROUPS = [
  { key: 'age0to14', label: '幼年 0–14 歲', color: 'var(--age-young)' },
  { key: 'age15to64', label: '青壯 15–64 歲', color: 'var(--age-work)' },
  { key: 'age65plus', label: '老年 65 歲以上', color: 'var(--age-old)' },
] as const

const pct = (n: number, d: number) => `${((n / d) * 100).toFixed(1)}%`

function Bar({ stats, title, thin }: { stats: DerivedStats; title: string; thin?: boolean }) {
  const [hover, setHover] = useState<string | null>(null)
  return (
    <div className={`age-row${thin ? ' is-thin' : ''}`}>
      <span className="age-row-title">{title}</span>
      <div className="age-bar" role="img" aria-label={`${title}年齡結構：${GROUPS.map((g) => `${g.label} ${pct(stats[g.key], stats.population)}`).join('，')}`}>
        {GROUPS.map((g) => (
          <div
            key={g.key}
            className={`age-seg${hover && hover !== g.key ? ' is-dim' : ''}`}
            style={{ flexGrow: stats[g.key], background: g.color }}
            onPointerEnter={() => setHover(g.key)}
            onPointerLeave={() => setHover(null)}
          >
            {hover === g.key && (
              <span className="tooltip" role="tooltip">
                <strong>{g.label}</strong>
                {stats[g.key].toLocaleString()} 人 · {pct(stats[g.key], stats.population)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function AgeStructure({ stats, township, name }: { stats: DerivedStats; township: DerivedStats; name: string }) {
  const isTownship = stats === township
  return (
    <section className="card age">
      <h3 className="card-label">年齡結構</h3>
      <Bar stats={stats} title={name} />
      {!isTownship && <Bar stats={township} title="全鄉" thin />}
      <ul className="legend">
        {GROUPS.map((g) => (
          <li key={g.key}>
            <i style={{ background: g.color }} />
            <span className="legend-label">{g.label}</span>
            <span className="legend-value">
              {stats[g.key].toLocaleString()} 人<em>{pct(stats[g.key], stats.population)}</em>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
