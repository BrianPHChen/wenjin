import type { MouseEvent } from 'react'
import { slogan } from '../data/policies'
import { MAP_HEIGHT, MAP_WIDTH, townshipD } from '../geo'

// 不改網址的 hash（hash 用來記錄選取的村）
const toTop = (e: MouseEvent) => {
  e.preventDefault()
  window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}

/** 置頂口號列：壯圍鄉剪影＋口號，捲動時一直看得到 */
export function SloganBar() {
  return (
    <div className="slogan-bar">
      <a className="slogan" href="#top" onClick={toTop} aria-label={`${slogan.join('，')}（回到頁首）`}>
        <svg className="slogan-mark" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} aria-hidden="true">
          <path d={townshipD} />
        </svg>
        {slogan.map((s) => <span key={s}>{s}</span>)}
      </a>
      <span className="slogan-who">吳文進｜壯圍鄉長候選人</span>
    </div>
  )
}
