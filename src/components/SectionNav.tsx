import { useEffect, useRef, useState, type MouseEvent } from 'react'

const LINKS = [
  { id: 'overview', label: '地圖' },
  { id: 'board', label: '鄉親建言', cta: true },
  { id: 'policies', label: '六大政見' },
  { id: 'videos', label: '走透透' },
] as const
type Id = (typeof LINKS)[number]['id']

const rectOf = (id: Id) => document.getElementById(id)?.getBoundingClientRect()

/** 口號列裡的區塊捷徑：捲到哪一區就標示哪一個 */
export function SectionNav() {
  const [active, setActive] = useState<Id | null>(null)
  // 寬螢幕時留言板跟地圖並排、同一個高度，靠最後點的捷徑決定標示哪個
  const clicked = useRef<Id | null>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const bar = document.querySelector('.slogan-bar')?.getBoundingClientRect().bottom ?? 0
      // 捲到底時最後一區頂不到上緣，改用畫面中間判斷
      const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 2
      const line = atBottom ? innerHeight / 2 : bar + 24
      const map = rectOf('overview')
      const board = rectOf('board')
      const sideBySide = !!map && !!board && board.top < map.top + 120
      let next: Id | null = null
      for (const { id } of LINKS) {
        const r = rectOf(id)
        if (!r || r.top > line) continue
        if (id === 'board' && sideBySide && clicked.current !== 'board') continue
        next = id
      }
      setActive(next)
    }
    const onScroll = () => void (frame ||= requestAnimationFrame(update))
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  // 不改網址的 hash（hash 用來記錄選取的村）
  const go = (id: Id) => (e: MouseEvent) => {
    e.preventDefault()
    clicked.current = id
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ block: 'start' })
  }

  return (
    <nav className="section-nav" aria-label="頁面捷徑">
      {LINKS.map((l) => (
        <a
          key={l.id}
          href={`#${l.id}`}
          onClick={go(l.id)}
          className={'cta' in l ? 'is-cta' : undefined}
          aria-current={active === l.id ? 'location' : undefined}
        >
          {l.label}
        </a>
      ))}
    </nav>
  )
}
