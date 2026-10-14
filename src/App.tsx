import { useEffect, useState } from 'react'
import { villages } from './geo'
import { useFeedback } from './feedbackStore'
import { FeedbackBoard } from './components/FeedbackBoard'
import { InsightPanel } from './components/InsightPanel'
import { Mascot } from './components/Mascot'
import { MoodStructure } from './components/MoodStructure'
import { Policies } from './components/Policies'
import { SloganBar } from './components/SloganBar'
import { VillageIssueTable } from './components/VillageIssueTable'
import { VideoSection } from './components/VideoSection'
import { VillageMap } from './components/VillageMap'

export default function App() {
  // 網址 #村代碼 可直接分享某一村
  const [selected, setSelected] = useState<string | null>(() => {
    const code = location.hash.slice(1)
    return villages.some((v) => v.code === code) ? code : null
  })
  const [hovered, setHovered] = useState<string | null>(null)
  const { township: T, statsFor, scale, status } = useFeedback()

  useEffect(() => {
    history.replaceState(null, '', selected ? `#${selected}` : location.pathname + location.search)
  }, [selected])

  useEffect(() => {
    // 對話框開著時 Esc 是關對話框
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !document.querySelector('dialog[open]') && setSelected(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const village = villages.find((v) => v.code === selected) ?? null
  const s = statsFor(selected)
  const name = village?.name ?? '壯圍鄉'

  return (
    <>
      <SloganBar />
      <div className="page" id="top">
        <header className="masthead">
          <p className="eyebrow">宜蘭縣 · 壯圍鄉</p>
          <h1>
            吳文進｜壯圍鄉長候選人
          </h1>
          <p className="lede">點選地圖上的村，左邊建言統計與右邊鄉親留言會切換成該村；再點一次或按 Esc 回到全鄉。</p>
        </header>

        <main className="ring">
          <div className="ring-title">
            <h2>{name}</h2>
            <p>
              {village ? (
                <>
                  {village.nameEn} · {s.total} 則建言
                  <button type="button" className="link" onClick={() => setSelected(null)}>
                    ← 回到全鄉
                  </button>
              </>
            ) : (
              <>16 村 · {status === 'loading' ? '載入中…' : `${T.total} 則建言`}</>
            )}
          </p>
        </div>

        <InsightPanel stats={s} township={T} isVillage={!!village} />

        <div className="map-wrap">
          <VillageMap selected={selected} hovered={hovered} onSelect={setSelected} onHover={setHovered} />
          <div className="map-legend">
            <span className="map-legend-title">建言數</span>
            <ol>
              {scale.stepRanges.map((r, k) => (
                <li key={k}>
                  <i className={`step-${k}`} />
                  {r}
                </li>
              ))}
            </ol>
            <span className="map-legend-note">村名下方為該村最在意的議題</span>
          </div>
        </div>

        <FeedbackBoard selected={selected} onSelect={setSelected} />

        <MoodStructure stats={s} township={T} name={name} />
      </main>

      <VillageIssueTable selected={selected} hovered={hovered} onSelect={setSelected} onHover={setHovered} />

      <p className="colophon">
        村里界：內政部國土測繪中心 村里界圖（TWD97，114 年版）
      </p>

      <Policies />

      <VideoSection />

      <Mascot villageName={village?.name ?? null} topIssue={s.topIssue} />
    </div>
    </>
  )
}
