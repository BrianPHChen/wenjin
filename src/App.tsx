import { useEffect, useState } from 'react'
import { IS_PLACEHOLDER } from './data/villageStats'
import { townshipAreaKm2, villages } from './geo'
import { statsFor, townshipStats as T } from './stats'
import { AgeStructure } from './components/AgeStructure'
import { StatCard } from './components/StatCard'
import { VillageMap } from './components/VillageMap'
import { VillageTable } from './components/VillageTable'
import { Mascot } from './components/Mascot'
import { Policies } from './components/Policies'

const share = (n: number, d: number) => `佔全鄉 ${((n / d) * 100).toFixed(1)}%`
const vsTownship = (n: number, digits = 1) => `全鄉 ${n.toFixed(digits)}`

export default function App() {
  // 網址 #村代碼 可直接分享某一村
  const [selected, setSelected] = useState<string | null>(() => {
    const code = location.hash.slice(1)
    return villages.some((v) => v.code === code) ? code : null
  })
  const [hovered, setHovered] = useState<string | null>(null)

  useEffect(() => {
    history.replaceState(null, '', selected ? `#${selected}` : location.pathname + location.search)
  }, [selected])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const village = villages.find((v) => v.code === selected) ?? null
  const s = statsFor(selected)
  const name = village?.name ?? '壯圍鄉'
  const area = village?.areaKm2 ?? townshipAreaKm2

  return (
    <div className="page">
      <header className="masthead">
        <p className="eyebrow">宜蘭縣 · 壯圍鄉</p>
        <h1>
          壯圍十六村
          {IS_PLACEHOLDER && <span className="badge" title="目前數據為示意用假資料">示意資料</span>}
        </h1>
        <p className="lede">點選地圖上的村，周圍的數據會切換成該村；再點一次或按 Esc 回到全鄉。</p>
      </header>

      <main className="ring">
        <div className="ring-title">
          <h2>{name}</h2>
          <p>
            {village ? (
              <>
                {village.nameEn} · 面積 {village.areaKm2.toFixed(2)} km²
                <button type="button" className="link" onClick={() => setSelected(null)}>
                  ← 回到全鄉
                </button>
              </>
            ) : (
              <>16 村 · 面積 {townshipAreaKm2.toFixed(2)} km²</>
            )}
          </p>
        </div>

        <StatCard className="c-pop" label="總人口" value={s.population} unit="人"
          note={village ? share(s.population, T.population) : '16 村合計'} />
        <StatCard className="c-hh" label="戶數" value={s.households} unit="戶"
          note={village ? share(s.households, T.households) : '16 村合計'} />
        <StatCard className="c-hsize" label="平均每戶人口" value={s.householdSize} digits={2} unit="人/戶"
          note={village ? vsTownship(T.householdSize, 2) : '人口 ÷ 戶數'} />

        <StatCard className="c-density" label="人口密度" value={s.population / area} unit="人/km²"
          note={village ? vsTownship(T.population / townshipAreaKm2, 0) : `面積 ${townshipAreaKm2.toFixed(2)} km²`} />

        <StatCard className="c-male" label="男性人口" value={s.male} unit="人"
          note={`${((s.male / s.population) * 100).toFixed(1)}%`} />
        <StatCard className="c-female" label="女性人口" value={s.female} unit="人"
          note={`${((s.female / s.population) * 100).toFixed(1)}%`} />

        <StatCard className="c-sex" label="性別比" value={s.sexRatio} digits={1}
          note={village ? vsTownship(T.sexRatio) : '每 100 位女性對應男性數'} />
        <StatCard className="c-aging" label="老化指數" value={s.agingIndex} digits={1}
          note={village ? vsTownship(T.agingIndex) : '65 歲以上 ÷ 0–14 歲 × 100'} />

        <div className="map-wrap">
          <VillageMap selected={selected} hovered={hovered} onSelect={setSelected} onHover={setHovered} />
        </div>

        <AgeStructure stats={s} township={T} name={name} />
      </main>

      <VillageTable selected={selected} hovered={hovered} onSelect={setSelected} onHover={setHovered} />

      <p className="colophon">
        村里界：內政部國土測繪中心 村里界圖（TWD97，114 年版）
        {IS_PLACEHOLDER && ' · 統計數據為示意用假資料'}
      </p>

      <Policies />

      <Mascot villageName={village?.name ?? null} />
    </div>
  )
}
