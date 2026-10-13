// ⚠️ 政見細項為示意文字，請以候選人正式政見取代。
// tone 為卡片色調；issue 對應鄉親建言的議題類別，三大關注議題會連到對應政見

import type { Issue } from './feedback'

export interface Policy {
  title: string
  summary: string
  points: string[]
  tone: 'old' | 'young' | 'work'
  icon: 'elder' | 'family' | 'finance'
  issue?: Issue
}

export const POLICIES_PLACEHOLDER = true

export const policies: Policy[] = [
  {
    title: '銀髮族敬老福利',
    summary: '讓長輩在熟悉的村裡安心終老。',
    points: ['65 歲以上長者健保免費', '老人全口假牙補助', '智慧雙保配套'],
    tone: 'old',
    icon: 'elder',
    issue: '長照',
  },
  {
    title: '友善育兒支持',
    summary: '讓年輕家庭願意留在壯圍、回到壯圍。',
    points: ['0 至 2 歲幼兒營養金', '增設公共托育名額', '親子共融公園與遊戲場'],
    tone: 'young',
    icon: 'family',
    issue: '育兒',
  },
  {
    title: '穩健財源規劃',
    summary: '每一分錢都用在刀口上，施政才能長久。',
    points: ['公共造產盈餘回饋', '預算公開透明', '爭取中央與縣府補助'],
    tone: 'work',
    icon: 'finance',
  },
]
