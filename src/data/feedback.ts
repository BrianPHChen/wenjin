// ⚠️ 全部為 mock 留言，上線前請改接真實資料（例如表單匯出或後端 API）。
// village 為 VILLCODE；mood 決定留言旁的表情頭像。

export const CATEGORIES = ['環境', '交通', '育兒', '觀光', '文化', '其他'] as const
export type Category = (typeof CATEGORIES)[number]
export type Mood = 'angry' | 'worried' | 'neutral' | 'happy'

export interface Feedback {
  no: number
  village: string
  category: Category
  mood: Mood
  text: string
}

export const FEEDBACK_PLACEHOLDER = true
/** 「我也要反映」表單連結；留空則按鈕顯示即將開放 */
export const FEEDBACK_FORM_URL = ''

export const feedback: Feedback[] = [
  { no: 1287, village: '10002060005', category: '交通', mood: 'angry', text: '復興村往宜蘭市那段路面坑坑洞洞，下雨積水看不到洞，機車騎過去很危險，拜託趕快重鋪。' },
  { no: 1284, village: '10002060013', category: '環境', mood: 'worried', text: '大福海邊假日遊客多，垃圾常常滿出來，希望增加垃圾桶和清運次數。' },
  { no: 1281, village: '10002060012', category: '其他', mood: 'happy', text: '我們全家都支持你！壯圍需要有魄力又肯做事的人，加油！' },
  { no: 1279, village: '10002060011', category: '交通', mood: 'worried', text: '美城村巷子裡的路燈壞了快一個月，晚上走路回家暗暗的很怕，麻煩派人來修。' },
  { no: 1276, village: '10002060003', category: '育兒', mood: 'worried', text: '小孩上幼兒園要跑到市區，接送很辛苦，希望壯圍能多一間公立幼兒園。' },
  { no: 1274, village: '10002060004', category: '觀光', mood: 'neutral', text: '東港這邊看日出很漂亮，但沒有指標也沒有停車場，外地朋友來都找不到路。' },
  { no: 1270, village: '10002060015', category: '環境', mood: 'angry', text: '壯六村排水溝很久沒清，夏天很臭還有蚊子，颱風來一定淹水。' },
  { no: 1268, village: '10002060001', category: '文化', mood: 'happy', text: '希望廟口的傳統戲曲活動可以繼續辦，讓小朋友也認識在地文化。' },
  { no: 1265, village: '10002060007', category: '交通', mood: 'worried', text: '公車班次太少，老人家去醫院看病要等一個多小時，可以增加接駁車嗎？' },
  { no: 1262, village: '10002060010', category: '其他', mood: 'happy', text: '上次來村裡拜訪很親切，聽我們講很久，這一票投給你！' },
  { no: 1259, village: '10002060002', category: '育兒', mood: 'neutral', text: '美福村附近沒有適合小小孩的公園，溜滑梯都生鏽了，希望能翻新。' },
  { no: 1255, village: '10002060014', category: '環境', mood: 'worried', text: '田邊常有人亂倒廢棄物，晚上偷偷載來丟，希望裝監視器。' },
  { no: 1252, village: '10002060006', category: '觀光', mood: 'happy', text: '過嶺的自行車道騎起來很舒服，如果沿路多幾個休息站和廁所就更好了。' },
  { no: 1248, village: '10002060009', category: '交通', mood: 'angry', text: '古亭村路口沒有紅綠燈，大車開很快，上下學時間很危險，拜託設號誌。' },
  { no: 1245, village: '10002060016', category: '文化', mood: 'neutral', text: '社區活動中心很舊了，希望整修後可以開長輩書法班和兒童才藝課。' },
  { no: 1241, village: '10002060017', category: '其他', mood: 'happy', text: '支持！希望壯圍越來越好，年輕人願意回來。' },
  { no: 1238, village: '10002060013', category: '交通', mood: 'worried', text: '大福往頭城的路晚上很暗，路燈間距太遠，騎車回家常常看不清楚。' },
  { no: 1234, village: '10002060005', category: '育兒', mood: 'happy', text: '0 到 2 歲營養金這個政見很實在，年輕爸媽真的很需要！' },
  { no: 1231, village: '10002060003', category: '環境', mood: 'neutral', text: '新南這邊流浪狗越來越多，晚上會追機車，希望有 TNR 和收容的配套。' },
  { no: 1227, village: '10002060012', category: '觀光', mood: 'neutral', text: '可以把在地農產品和觀光結合，辦個市集讓遊客來買，農民也多一份收入。' },
  { no: 1224, village: '10002060011', category: '其他', mood: 'happy', text: '長輩健保免費太讚了，我爸媽聽到很開心，支持到底！' },
  { no: 1220, village: '10002060001', category: '交通', mood: 'angry', text: '吉祥村路邊違停很嚴重，會車都要等，消防車根本進不來。' },
  { no: 1217, village: '10002060010', category: '文化', mood: 'happy', text: '希望可以把老照片和村史整理起來，做個小小的社區博物館。' },
  { no: 1213, village: '10002060015', category: '育兒', mood: 'worried', text: '雙薪家庭下課後沒人顧小孩，希望學校附近有課後照顧班。' },
]
