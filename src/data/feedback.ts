// 建言的類別與心情。資料本身在 Firestore（publicFeed），由 src/feedbackStore.tsx 載入。
// village 為 VILLCODE；category「其他」視為支持留言，不列入議題統計。

export const CATEGORIES = ['交通', '環境', '長照', '育兒', '文教', '觀光', '農業', '其他'] as const
export type Category = (typeof CATEGORIES)[number]
export type Issue = Exclude<Category, '其他'>
export const ISSUES = CATEGORIES.filter((c): c is Issue => c !== '其他')

export const MOODS = ['angry', 'worried', 'neutral', 'happy'] as const
export type Mood = (typeof MOODS)[number]
export const MOOD_LABEL: Record<Mood, string> = { angry: '生氣', worried: '擔心', neutral: '普通', happy: '開心' }

/** publicFeed 裡的一則公開留言（審核通過、只含可公開欄位） */
export interface Feedback {
  id: string
  no: number
  village: string
  category: Category
  mood: Mood
  text: string
  /** null = 匿名村民 */
  name: string | null
  /** 送出時間（ms） */
  at: number
  /** 示意資料 */
  mock?: true
}

/** 改名過的舊類別，讀到舊資料時換成新名稱 */
export const LEGACY_CATEGORY: Record<string, Category> = { 文化: '文教' }

export const TEXT_MIN = 5
export const TEXT_MAX = 300
