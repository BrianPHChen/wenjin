import { feedback, ISSUES, MOODS, type Feedback, type Issue, type Mood } from './data/feedback'
import { villages } from './geo'

export interface FeedbackStats {
  total: number
  /** 「其他」類別 = 支持留言 */
  support: number
  villageCount: number
  /** 依則數由多到少，不含「其他」 */
  issues: { issue: Issue; count: number; share: number }[]
  topIssue: Issue | null
  /** 生氣＋擔心最多的議題 */
  topConcern: Issue | null
  topConcernCount: number
  moods: Record<Mood, number>
}

function summarize(list: Feedback[]): FeedbackStats {
  const issueCount = Object.fromEntries(ISSUES.map((i) => [i, 0])) as Record<Issue, number>
  const concernCount = { ...issueCount }
  // 平手時以最新一則留言的類別為準：列表是新到舊，先出現的就是最新
  const latest = { ...issueCount }
  const moods = Object.fromEntries(MOODS.map((m) => [m, 0])) as Record<Mood, number>
  let support = 0
  list.forEach((f, idx) => {
    moods[f.mood]++
    if (f.category === '其他') {
      support++
      return
    }
    issueCount[f.category]++
    if (latest[f.category] === 0) latest[f.category] = list.length - idx
    if (f.mood === 'angry' || f.mood === 'worried') concernCount[f.category]++
  })
  const issueTotal = list.length - support
  const rank = (counts: Record<Issue, number>) =>
    [...ISSUES].sort((a, b) => counts[b] - counts[a] || latest[b] - latest[a])
  const issues = rank(issueCount).map((issue) => ({
    issue,
    count: issueCount[issue],
    share: issueTotal ? issueCount[issue] / issueTotal : 0,
  }))
  const concern = rank(concernCount)[0]
  return {
    total: list.length,
    support,
    villageCount: new Set(list.map((f) => f.village)).size,
    issues,
    topIssue: issues[0]?.count ? issues[0].issue : null,
    topConcern: concernCount[concern] ? concern : null,
    topConcernCount: concernCount[concern],
    moods,
  }
}

export const townshipFeedback = summarize(feedback)

export const villageFeedback: Record<string, FeedbackStats> = Object.fromEntries(
  villages.map((v) => [v.code, summarize(feedback.filter((f) => f.village === v.code))]),
)

export function feedbackFor(code: string | null): FeedbackStats {
  return (code && villageFeedback[code]) || townshipFeedback
}

export const maxVillageTotal = Math.max(...Object.values(villageFeedback).map((s) => s.total))
