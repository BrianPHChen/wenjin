import { useCallback, useEffect, useRef, useState } from 'react'
import { MayorFigure } from './MayorFigure'
import '../mascot.css'

type Action = 'idle' | 'wave' | 'fist' | 'bow' | 'nod' | 'point' | 'jump'

// 各動作長度需與 mascot.css 的 animation-duration 一致
const DURATION: Record<Exclude<Action, 'idle'>, number> = {
  wave: 1800,
  fist: 1600,
  bow: 1500,
  nod: 1400,
  point: 1800,
  jump: 650,
}
const RANDOM_ACTIONS: Action[] = ['wave', 'fist', 'bow', 'nod']
const IDLE_MIN_MS = 8000
const IDLE_MAX_MS = 20000

// 捲動彈簧：捲動量轉成速度衝量，再用彈簧拉回右下角
const IMPULSE = 7 // 每捲 1px 加多少 px/s
const STIFFNESS = 120
const DAMPING = 11
const MAX_UP = -220 // 往上最多飄多遠
const MAX_DOWN = 28 // 往下最多沉多少（再多會跑出畫面）
const DRAG_SPEED = 520 // 速度超過就換成「被甩動」姿勢

// 暫代台詞，之後替換
const LINES = ['歡迎來到壯圍！', '點地圖上的村看看～', '有空來壯圍走走！', '大家一起加油！']

interface Props {
  /** 目前選取的村名，變更時文進會指向地圖並說話 */
  villageName: string | null
  /** 該村最在意的議題，選村時文進會一併提到 */
  topIssue?: string | null
}

export function Mascot({ villageName, topIssue }: Props) {
  const [action, setAction] = useState<Action>('idle')
  const [dragged, setDragged] = useState(false)
  const [bubble, setBubble] = useState<string | null>(null)
  const [minimized, setMinimized] = useState(false)
  const floater = useRef<HTMLDivElement>(null)
  const actionTimer = useRef<number>(0)
  const bubbleTimer = useRef<number>(0)
  const reduceMotion = useRef(false)
  const actionRef = useRef<Action>('idle')
  actionRef.current = action

  const play = useCallback((a: Exclude<Action, 'idle'>) => {
    window.clearTimeout(actionTimer.current)
    setAction(a)
    actionTimer.current = window.setTimeout(() => setAction('idle'), DURATION[a])
  }, [])

  const say = useCallback((text: string) => {
    window.clearTimeout(bubbleTimer.current)
    setBubble(text)
    bubbleTimer.current = window.setTimeout(() => setBubble(null), 3200)
  }, [])

  // 捲動彈簧
  useEffect(() => {
    reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion.current) return
    const s = { y: 0, v: 0 }
    let lastScroll = window.scrollY
    let lastTime = performance.now()
    let raf = 0
    let isDragged = false

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 1 / 30)
      lastTime = now
      s.v += (-STIFFNESS * s.y - DAMPING * s.v) * dt
      s.y += s.v * dt
      if (s.y < MAX_UP) { s.y = MAX_UP; s.v = Math.max(s.v, 0) }
      if (s.y > MAX_DOWN) { s.y = MAX_DOWN; s.v = Math.min(s.v, 0) }
      const tilt = Math.max(-14, Math.min(14, s.v * 0.018))
      if (floater.current) {
        floater.current.style.transform = `translate3d(0, ${s.y.toFixed(2)}px, 0) rotate(${tilt.toFixed(2)}deg)`
        floater.current.style.setProperty('--lift', String(Math.min(1, -s.y / 120)))
      }
      const nowDragged = Math.abs(s.v) > DRAG_SPEED
      if (nowDragged !== isDragged) {
        isDragged = nowDragged
        setDragged(nowDragged)
      }
      if (Math.abs(s.y) < 0.1 && Math.abs(s.v) < 0.1) {
        s.y = 0
        s.v = 0
        if (floater.current) floater.current.style.transform = ''
        raf = 0
        return
      }
      raf = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      const dy = window.scrollY - lastScroll
      lastScroll = window.scrollY
      s.v -= dy * IMPULSE
      if (!raf) {
        lastTime = performance.now()
        raf = requestAnimationFrame(tick)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  // 偶爾隨機做個動作
  useEffect(() => {
    if (reduceMotion.current || minimized) return
    let t = 0
    const schedule = () => {
      t = window.setTimeout(() => {
        if (document.visibilityState === 'visible' && !dragged && actionRef.current === 'idle') {
          play(RANDOM_ACTIONS[Math.floor(Math.random() * RANDOM_ACTIONS.length)] as Exclude<Action, 'idle'>)
        }
        schedule()
      }, IDLE_MIN_MS + Math.random() * (IDLE_MAX_MS - IDLE_MIN_MS))
    }
    schedule()
    return () => window.clearTimeout(t)
  }, [minimized, dragged, play])

  // 選村時指向地圖並介紹
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (!villageName || minimized) return
    play('point')
    say(topIssue ? `${villageName}最在意${topIssue}！` : `這裡是${villageName}！`)
    // 只在換村時說話，topIssue 跟著村變
  }, [villageName, minimized, play, say])

  useEffect(() => () => {
    window.clearTimeout(actionTimer.current)
    window.clearTimeout(bubbleTimer.current)
  }, [])

  const onClick = () => {
    if (minimized) {
      setMinimized(false)
      play('wave')
      say('我回來了！')
      return
    }
    play('jump')
    say(LINES[Math.floor(Math.random() * LINES.length)])
  }

  const classes = [
    'mascot',
    `act-${action}`,
    dragged && action === 'idle' ? 'is-dragged' : '',
    minimized ? 'is-minimized' : '',
  ].join(' ')

  return (
    <aside className={classes} aria-label="文進小幫手">
      <div className="mascot-floater" ref={floater}>
        {bubble && !minimized && (
          <p className="mascot-bubble" role="status">
            {bubble}
          </p>
        )}
        <button type="button" className="mascot-hit" onClick={onClick} aria-label={minimized ? '叫文進回來' : '跟文進打招呼'}>
          <MayorFigure />
        </button>
        {!minimized && (
          <button
            type="button"
            className="mascot-close"
            aria-label="收起文進"
            onClick={() => {
              setBubble(null)
              setMinimized(true)
            }}
          >
            ×
          </button>
        )}
      </div>
      <div className="mascot-shadow" aria-hidden="true" />
    </aside>
  )
}
