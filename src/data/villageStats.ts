// ⚠️ 示意用假資料 —— 之後請以戶政事務所／內政部統計資料取代。
// key 為內政部村里代碼 VILLCODE（與 zhuangwei.json 的 properties.VILLCODE 對應）。
// 規則：male + female = population；age0to14 + age15to64 + age65plus = population。

export interface VillageStats {
  population: number
  households: number
  male: number
  female: number
  age0to14: number
  age15to64: number
  age65plus: number
}

export const IS_PLACEHOLDER = true

export const villageStats: Record<string, VillageStats> = {
  '10002060001': { population: 2380, households: 813, male: 1222, female: 1158, age0to14: 188, age15to64: 1762, age65plus: 430 }, // 吉祥村
  '10002060002': { population: 1960, households: 708, male: 1003, female: 957, age0to14: 160, age15to64: 1303, age65plus: 497 }, // 美福村
  '10002060003': { population: 1481, households: 453, male: 775, female: 706, age0to14: 105, age15to64: 1080, age65plus: 296 }, // 新南村
  '10002060004': { population: 1938, households: 741, male: 988, female: 950, age0to14: 183, age15to64: 1296, age65plus: 459 }, // 東港村
  '10002060005': { population: 2803, households: 960, male: 1468, female: 1335, age0to14: 229, age15to64: 2013, age65plus: 561 }, // 復興村
  '10002060006': { population: 2168, households: 760, male: 1122, female: 1046, age0to14: 159, age15to64: 1522, age65plus: 487 }, // 過嶺村
  '10002060007': { population: 3016, households: 989, male: 1609, female: 1407, age0to14: 246, age15to64: 2215, age65plus: 555 }, // 永鎮村
  '10002060009': { population: 1242, households: 390, male: 657, female: 585, age0to14: 113, age15to64: 879, age65plus: 250 }, // 古亭村
  '10002060010': { population: 1532, households: 544, male: 788, female: 744, age0to14: 135, age15to64: 1099, age65plus: 298 }, // 功勞村
  '10002060011': { population: 2875, households: 925, male: 1453, female: 1422, age0to14: 298, age15to64: 1932, age65plus: 645 }, // 美城村
  '10002060012': { population: 2845, households: 921, male: 1447, female: 1398, age0to14: 294, age15to64: 2019, age65plus: 532 }, // 新社村
  '10002060013': { population: 993, households: 303, male: 523, female: 470, age0to14: 106, age15to64: 628, age65plus: 259 }, // 大福村
  '10002060014': { population: 1035, households: 348, male: 543, female: 492, age0to14: 89, age15to64: 730, age65plus: 216 }, // 古結村
  '10002060015': { population: 2993, households: 976, male: 1585, female: 1408, age0to14: 291, age15to64: 1940, age65plus: 762 }, // 壯六村
  '10002060016': { population: 1190, households: 431, male: 605, female: 585, age0to14: 88, age15to64: 875, age65plus: 227 }, // 順和村
  '10002060017': { population: 937, households: 326, male: 474, female: 463, age0to14: 97, age15to64: 609, age65plus: 231 }, // 美間村
}
