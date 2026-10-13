/** 地圖循序色階：把各村建言數等距切成 5 級 */
export const STEPS = 5

export interface CountScale {
  countStep: (total: number) => number
  /** 圖例用：每一級的則數範圍 */
  stepRanges: string[]
}

export function makeScale(totals: number[]): CountScale {
  const min = totals.length ? Math.min(...totals) : 0
  const max = totals.length ? Math.max(...totals) : 0
  const width = Math.max(1, (max - min + 1) / STEPS)
  return {
    countStep: (total) => Math.min(STEPS - 1, Math.floor((total - min) / width)),
    stepRanges: Array.from({ length: STEPS }, (_, k) => {
      const lo = Math.ceil(min + k * width)
      const hi = k === STEPS - 1 ? max : Math.ceil(min + (k + 1) * width) - 1
      return lo >= hi ? `${lo}` : `${lo}–${hi}`
    }),
  }
}
