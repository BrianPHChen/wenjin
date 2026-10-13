import type { ReactNode } from 'react'

export function TextStat({ label, value, note }: { label: string; value: string; note?: ReactNode }) {
  return (
    <section className="card stat">
      <h3 className="card-label">{label}</h3>
      <p className="stat-value stat-text">{value}</p>
      {note && <p className="stat-note">{note}</p>}
    </section>
  )
}
