// 政見內容依候選人政見小卡（art/S__168730640.jpg）。
// tone 為卡片色調；issues 對應鄉親建言的議題類別，三大關注議題會連到對應政見。
// 一個議題可對應多項政見，依政見順序顯示，所以主要對應的政見要排在前面

import type { Issue } from './feedback'

export interface Policy {
  title: string
  points: string[]
  tone: 'old' | 'young' | 'work'
  icon: 'care' | 'sunrise' | 'sprout' | 'bus' | 'book' | 'train'
  issues?: Issue[]
}

/** 競選口號，顯示在置頂口號列 */
export const slogan = ['深耕有進', '壯圍勁讚']

export const policies: Policy[] = [
  {
    title: '活力壯圍、全齡照顧',
    points: ['65歲以上健保免費', '老人全口假牙補助4萬元', '0至2歲每月補助3000元營養金', '減輕家長負擔，增設鄉內托嬰中心'],
    tone: 'old',
    icon: 'care',
    issues: ['長照', '育兒'],
  },
  {
    title: '魅力壯圍、國際聚焦',
    points: ['協力推動『國際龜山朝日節』', '串聯濱海、宜蘭河、蘭陽溪綠色低碳旅程'],
    tone: 'work',
    icon: 'sunrise',
    issues: ['觀光'],
  },
  {
    title: '富饒壯圍、幸福故鄉',
    points: ['協助在地創業，扶植青農返鄉', '加速農業轉型發展與升級', '開設在地農特產品市集'],
    tone: 'young',
    icon: 'sprout',
    issues: ['農業'],
  },
  {
    title: '便捷壯圍、永續城鄉',
    points: ['優化壯圍共乘站，提升安全、資訊與舒適度', '增設定點垃圾回收站', '優化壯圍停車友善空間'],
    tone: 'young',
    icon: 'bus',
    issues: ['交通', '環境'],
  },
  {
    title: '智慧壯圍、優質教育',
    points: ['打造五星級鄉立幼兒園', '推動幼兒園雙語教育', '充實圖書館閱讀與數位資源', '推廣藝文教育與傳統在地文化活動'],
    tone: 'old',
    icon: 'book',
    issues: ['文教', '育兒'],
  },
  {
    title: '高鐵特區、壯圍升級',
    points: ['全力支持高鐵延伸宜蘭，帶動壯圍產業升級', '規劃高鐵產業園區，增進觀光、經濟、交通、農業發展'],
    tone: 'work',
    icon: 'train',
    issues: ['交通', '農業'],
  },
]
