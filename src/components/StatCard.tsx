import type { ReactNode } from 'react'
import { useTween } from '../useSprings'

interface Props {
  label: string
  value: number
  digits?: number
  unit?: string
  note?: ReactNode
  className?: string
}

export function StatCard({ label, value, digits = 0, unit, note, className = '' }: Props) {
  const shown = useTween(value)
  return (
    <section className={`card stat ${className}`}>
      <h3 className="card-label">{label}</h3>
      <p className="stat-value">
        {shown.toLocaleString('zh-TW', { minimumFractionDigits: digits, maximumFractionDigits: digits })}
        {unit && <span className="stat-unit">{unit}</span>}
      </p>
      {note && <p className="stat-note">{note}</p>}
    </section>
  )
}
