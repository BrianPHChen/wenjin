import { useEffect, useRef, useState } from 'react'

const STIFFNESS = 260
const DAMPING = 18

/**
 * 每個 key 一個彈簧，朝 targets[key] 移動（未列出的 key 目標為 0）。
 * 回傳目前數值；全部靜止且歸零的 key 會被移除。
 */
export function useSprings(targets: Record<string, number>): Record<string, number> {
  const [values, setValues] = useState<Record<string, number>>({})
  const state = useRef<Record<string, { x: number; v: number }>>({})
  const targetRef = useRef(targets)
  targetRef.current = targets
  const frame = useRef<number | null>(null)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    for (const k of Object.keys(targets)) state.current[k] ??= { x: 0, v: 0 }

    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30)
      last = now
      let moving = false
      for (const [k, s] of Object.entries(state.current)) {
        const target = targetRef.current[k] ?? 0
        if (reduceMotion) {
          s.x = target
          s.v = 0
        } else {
          s.v += (STIFFNESS * (target - s.x) - DAMPING * s.v) * dt
          s.x += s.v * dt
        }
        if (Math.abs(target - s.x) < 0.01 && Math.abs(s.v) < 0.01) {
          s.x = target
          s.v = 0
          if (target === 0) delete state.current[k]
        } else {
          moving = true
        }
      }
      setValues(Object.fromEntries(Object.entries(state.current).map(([k, s]) => [k, s.x])))
      frame.current = moving ? requestAnimationFrame(tick) : null
    }
    if (frame.current === null) frame.current = requestAnimationFrame(tick)
  }, [targets])

  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = null
  }, [])

  return values
}

/** 數字從舊值平滑過渡到新值 */
export function useTween(value: number, duration = 450): number {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const start = performance.now()
    const a = from.current
    let raf = 0
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const e = 1 - (1 - t) ** 3
      const x = a + (value - a) * e
      from.current = x
      setShown(x)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return shown
}
