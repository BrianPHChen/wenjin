import { villages } from '../geo'
import { statsFor } from '../stats'

interface Props {
  selected: string | null
  hovered: string | null
  onSelect: (code: string | null) => void
  onHover: (code: string | null) => void
}

export function VillageTable({ selected, hovered, onSelect, onHover }: Props) {
  const rows = villages.map((v) => ({ v, s: statsFor(v.code) }))
  const max = Math.max(...rows.map((r) => r.s.population))
  return (
    <section className="card table-card">
      <h3 className="card-label">十六村一覽</h3>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">村名</th>
              <th scope="col" className="num">人口</th>
              <th scope="col" className="num">戶數</th>
              <th scope="col" className="num">面積 km²</th>
              <th scope="col" className="num">老年比例</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ v, s }) => (
              <tr
                key={v.code}
                className={`${v.code === selected ? 'is-selected' : ''}${v.code === hovered ? ' is-hovered' : ''}`}
                onClick={() => onSelect(v.code === selected ? null : v.code)}
                onPointerEnter={() => onHover(v.code)}
                onPointerLeave={() => onHover(null)}
              >
                <th scope="row">
                  <button type="button" aria-pressed={v.code === selected}>{v.name}</button>
                </th>
                <td className="num">
                  <span className="cell-bar" style={{ width: `${(s.population / max) * 100}%` }} />
                  {s.population.toLocaleString()}
                </td>
                <td className="num">{s.households.toLocaleString()}</td>
                <td className="num">{v.areaKm2.toFixed(2)}</td>
                <td className="num">{((s.age65plus / s.population) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
