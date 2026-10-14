// 社群連結與「文進走透透」影片。影片清單存在 Firestore site/videos，由審核頁維護。

export const SOCIAL = {
  instagram: 'https://www.instagram.com/wu_wen.jin/',
  facebook: 'https://www.facebook.com/share/1Cn2qistYc/',
}

export interface Video {
  /** IG 貼文代碼：instagram.com/reel/{code}/ */
  code: string
  title: string
  /** YYYY-MM-DD */
  date: string
  /** 封面圖網址（Firebase Storage covers/），沒有就顯示彩色卡片 */
  cover?: string
}

/** 網站上顯示最新幾支 */
export const VIDEO_LIMIT = 6
export const VIDEO_TITLE_MAX = 24

/** 從 IG 網址取出貼文代碼；不是 IG 貼文網址就回傳 null */
export function parseInstagram(url: string): string | null {
  const m = url.trim().match(/instagram\.com\/(?:[\w.]+\/)?(?:reels?|p|tv)\/([A-Za-z0-9_-]{5,})/)
  return m ? m[1] : null
}

export const byNewest = (a: Video, b: Video) => b.date.localeCompare(a.date)
