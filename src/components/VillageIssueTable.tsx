import { useEffect, useState } from 'react'
import { MOOD_LABEL, MOODS } from '../data/feedback'
import { useFeedback } from '../feedbackStore'
import { villages } from '../geo'
import { hoverProps } from '../hover'

interface Props {
  selected: string | null
  hovered: string | null
  onSelect: (code: string | null) => void
  onHover: (code: string | null) => void
}

const NARROW = '(max-width: 760px)'
function useNarrow() {
  const [narrow, setNarrow] = useState(() => matchMedia(NARROW).matches)
  useEffect(() => {
    const mq = matchMedia(NARROW)
    const onChange = () => setNarrow(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return narrow
}

export function VillageIssueTable({ selected, hovered, onSelect, onHover }: Props) {
  const { villages: villageFeedback, maxVillageTotal } = useFeedback()
  const rows = villages
    .map((v) => ({ v, s: villageFeedback[v.code] }))
    .sort((a, b) => b.s.total - a.s.total)
  // 手機版預設收合；寬螢幕一律展開
  const narrow = useNarrow()
  const [open, setOpen] = useState(false)
  const collapsed = narrow && !open
  const top = rows[0]
  return (
    <section className={`card table-card${collapsed ? ' is-collapsed' : ''}`}>
      {!narrow ? (
        <h3 className="card-label">各村最在意的議題</h3>
      ) : (
        <h3 className="card-label">
          <button type="button" className="table-toggle" aria-expanded={open} aria-controls="village-issue-table" onClick={() => setOpen((o) => !o)}>
            <span>各村最在意的議題</span>
            {top?.s.total > 0 && <span className="table-toggle-note">建言最多：{top.v.name} {top.s.total} 則</span>}
            <span className="table-toggle-icon" aria-hidden="true">▾</span>
          </button>
        </h3>
      )}
      <div className="table-scroll" id="village-issue-table" hidden={collapsed}>
        <table>
          <thead>
            <tr>
              <th scope="col">村名</th>
              <th scope="col" className="num">建言數</th>
              <th scope="col">最在意議題</th>
              <th scope="col">鄉親情緒</th>
              <th scope="col" className="num">支持留言</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ v, s }) => (
              <tr
                key={v.code}
                className={`${v.code === selected ? 'is-selected' : ''}${v.code === hovered ? ' is-hovered' : ''}`}
                onClick={() => onSelect(v.code === selected ? null : v.code)}
                {...hoverProps(v.code, onHover)}
              >
                <th scope="row">
                  <button type="button" aria-pressed={v.code === selected}>{v.name}</button>
                </th>
                <td className="num">
                  <span className="cell-bar" style={{ width: `${(s.total / maxVillageTotal) * 100}%` }} />
                  {s.total}
                </td>
                <td>{s.topIssue ? <span className="issue-chip">{s.topIssue}</span> : '—'}</td>
                <td>
                  <span
                    className="mini-moods"
                    role="img"
                    aria-label={MOODS.map((m) => `${MOOD_LABEL[m]} ${s.moods[m]} 則`).join('，')}
                    title={MOODS.map((m) => `${MOOD_LABEL[m]} ${s.moods[m]}`).join(' · ')}
                  >
                    {MOODS.filter((m) => s.moods[m] > 0).map((m) => (
                      <i key={m} style={{ flexGrow: s.moods[m], background: `var(--mood-${m})` }} />
                    ))}
                  </span>
                </td>
                <td className="num">{s.support}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
