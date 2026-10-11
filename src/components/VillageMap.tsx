import { useMemo, type KeyboardEvent } from 'react'
import { MAP_HEIGHT, MAP_WIDTH, townshipD, villages, type Village } from '../geo'
import { useSprings } from '../useSprings'
import { focusHoverProps, hoverProps } from '../hover'

const SLAB_DEPTH = 9 // 全鄉底座厚度
const LIFT_SELECTED = 20
const LIFT_HOVER = 7

interface Props {
  selected: string | null
  hovered: string | null
  onSelect: (code: string | null) => void
  onHover: (code: string | null) => void
}

export function VillageMap({ selected, hovered, onSelect, onHover }: Props) {
  const targets = useMemo(() => {
    const t: Record<string, number> = {}
    if (hovered && hovered !== selected) t[hovered] = LIFT_HOVER
    if (selected) t[selected] = LIFT_SELECTED
    return t
  }, [selected, hovered])
  const lifts = useSprings(targets)

  // 浮起中的村，選取的那個最後畫（在最上層）
  const lifted = villages
    .filter((v) => (lifts[v.code] ?? 0) > 0.05)
    .sort((a, b) => (a.code === selected ? 1 : b.code === selected ? -1 : 0))

  const toggle = (code: string) => onSelect(code === selected ? null : code)
  const onKey = (e: KeyboardEvent, code: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle(code)
    } else if (e.key === 'Escape') {
      onSelect(null)
    }
  }

  return (
    <svg
      className="village-map"
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT + SLAB_DEPTH + 8}`}
      role="group"
      aria-label="壯圍鄉村里地圖，點選村以查看數據"
      onClick={() => onSelect(null)}
    >
      <defs>
        <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <pattern id="waves" width="36" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 7 q9 -6 18 0 t18 0" fill="none" stroke="var(--sea-line)" strokeWidth="1.2" />
        </pattern>
        <linearGradient id="sea-fade" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id="sea-mask">
          <rect x={MAP_WIDTH * 0.45} y="0" width={MAP_WIDTH * 0.55} height={MAP_HEIGHT + 40} fill="url(#sea-fade)" />
        </mask>
      </defs>

      {/* 海面（東側）與方位 */}
      <rect x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT + 40} fill="url(#waves)" mask="url(#sea-mask)" />
      <text className="map-deco" x={MAP_WIDTH - 24} y={MAP_HEIGHT * 0.42} textAnchor="end">太平洋</text>
      <g className="compass" transform={`translate(${MAP_WIDTH - 40}, 44)`} aria-hidden="true">
        <path d="M0 -18 L6 4 L0 0 L-6 4 Z" />
        <text y="18" textAnchor="middle">N</text>
      </g>

      {/* 底座陰影與厚度 */}
      <path d={townshipD} transform={`translate(4, ${SLAB_DEPTH + 6})`} className="slab-shadow" filter="url(#soft-shadow)" />
      {Array.from({ length: SLAB_DEPTH }, (_, i) => SLAB_DEPTH - i).map((k) => (
        <path key={k} d={townshipD} transform={`translate(0, ${k})`} className="slab-side" />
      ))}

      {/* 村面 */}
      {villages.map((v) => {
        const lift = lifts[v.code] ?? 0
        return (
          <path
            key={v.code}
            d={v.d}
            className={`village${lift > 0.05 ? ' is-socket' : ''}`}
            tabIndex={0}
            role="button"
            aria-pressed={v.code === selected}
            aria-label={v.name}
            onClick={(e) => {
              e.stopPropagation()
              toggle(v.code)
            }}
            onKeyDown={(e) => onKey(e, v.code)}
            {...hoverProps(v.code, onHover)}
            {...focusHoverProps(v.code, onHover)}
          />
        )
      })}

      {/* 平面村名 */}
      <g className="labels" aria-hidden="true">
        {villages.map((v) =>
          (lifts[v.code] ?? 0) > 0.05 ? null : (
            <text key={v.code} x={v.centroid[0]} y={v.centroid[1]} className="village-label">
              {v.name.replace('村', '')}
            </text>
          ),
        )}
      </g>

      {/* 浮起的村 */}
      {lifted.map((v) => (
        <LiftedVillage
          key={v.code}
          village={v}
          lift={lifts[v.code]}
          active={v.code === selected}
          onClick={() => toggle(v.code)}
          onHover={onHover}
        />
      ))}
    </svg>
  )
}

function LiftedVillage({
  village: v,
  lift,
  active,
  onClick,
  onHover,
}: {
  village: Village
  lift: number
  active: boolean
  onClick: () => void
  onHover: (code: string | null) => void
}) {
  // 側面用一層層往上疊的路徑模擬擠出厚度（每 1.5 單位一層）
  const layers = Math.max(1, Math.ceil(lift / 1.5))
  const t = Math.min(lift / LIFT_SELECTED, 1.2)
  return (
    <g className={`lifted${active ? ' is-active' : ''}`} aria-hidden="true">
      <path
        d={v.d}
        className="lift-shadow"
        transform={`translate(${2 + lift * 0.35}, ${lift * 0.25})`}
        filter="url(#soft-shadow)"
        style={{ opacity: 0.18 + 0.3 * t }}
      />
      {Array.from({ length: layers }, (_, i) => (
        <path key={i} d={v.d} className="lift-side" transform={`translate(0, ${-(lift * i) / layers})`} />
      ))}
      <path
        d={v.d}
        className="lift-top"
        transform={`translate(0, ${-lift})`}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        {...hoverProps(v.code, onHover)}
      />
      <text x={v.centroid[0]} y={v.centroid[1] - lift} className="village-label is-lifted">
        {v.name.replace('村', '')}
      </text>
    </g>
  )
}
