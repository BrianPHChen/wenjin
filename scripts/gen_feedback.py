"""產生示意鄉親建言（src/data/mockFeedback.ts），由審核頁匯入資料庫。
用法：python3 scripts/gen_feedback.py"""
import json, random, re

random.seed(2026)
geo = json.load(open('src/data/zhuangwei.json'))
villages = [(f['properties']['VILLCODE'], f['properties']['VILLNAME'].replace('村', '')) for f in geo['features']]

T = {
 '交通': ['{v}村路面坑洞很多，下雨積水看不到，機車騎過去很危險。', '{v}村巷子裡的路燈壞了好幾天，晚上走路很暗，麻煩派人修。',
         '{v}村路口沒有紅綠燈，大車開很快，上下學時間很危險。', '公車班次太少，{v}村的長輩去市區看病要等很久。',
         '{v}村路邊違停嚴重，會車都要等，消防車進不來。', '{v}村往宜蘭市的路晚上很暗，希望加裝路燈。',
         '{v}村學校附近沒有人行道，小朋友走路上學很危險。'],
 '環境': ['{v}村排水溝很久沒清，夏天很臭又有蚊子。', '{v}村田邊常有人亂倒廢棄物，希望裝監視器。',
         '{v}村流浪狗越來越多，晚上會追機車。', '{v}村颱風天常淹水，希望改善排水系統。',
         '{v}村垃圾車時間太早，上班族都趕不上。', '{v}村海邊垃圾很多，希望定期淨灘。'],
 '長照': ['{v}村長輩很多，希望社區關懷據點可以每天開。', '家裡長輩行動不便，希望{v}村有長照交通車。',
         '{v}村獨居老人越來越多，希望有人定期探訪。', '長輩健保免費這個政見很好，{v}村很多老人家需要。',
         '{v}村離醫院太遠，希望有巡迴醫療。', '老人假牙很貴，補助真的很需要，{v}村長輩都在討論。'],
 '育兒': ['{v}村附近沒有公立幼兒園，接送很辛苦。', '{v}村的兒童遊戲場設施老舊，希望翻新。',
         '雙薪家庭下課後沒人顧小孩，希望{v}村有課後照顧班。', '0 到 2 歲營養金很實在，{v}村年輕爸媽很需要。',
         '{v}村托嬰中心名額不夠，排不到。', '希望{v}村有親子館，下雨天也有地方帶小孩。'],
 '觀光': ['{v}村風景很漂亮，但沒有指標也沒有停車場。', '希望{v}村可以辦農產市集，吸引遊客也幫農民增加收入。',
         '{v}村的自行車道很舒服，希望多設休息站和廁所。', '假日遊客多，{v}村的公廁不夠用。',
         '可以把{v}村的老房子和田園風景規劃成散步路線。'],
 '文化': ['希望{v}村廟口的傳統戲曲活動可以繼續辦。', '{v}村社區活動中心很舊，希望整修後開才藝課。',
         '希望把{v}村的老照片和村史整理起來。', '{v}村的節慶活動很有特色，希望鄉公所多支持。',
         '希望{v}村有社區圖書室，讓小孩放學有地方看書。'],
 '其他': ['我們全家都支持你！壯圍需要肯做事的人，加油！', '上次來{v}村拜訪很親切，這一票投給你！',
         '支持！希望壯圍越來越好，年輕人願意回來。', '{v}村挺你！一起讓壯圍更好！',
         '看到你常常來{v}村走動，很有誠意，支持！', '加油！我們{v}村的鄰居都很期待你的表現。'],
}
ISSUES = ['交通', '環境', '長照', '育兒', '觀光', '文化']
MOODS = {  # 各類別的情緒傾向（angry, worried, neutral, happy）
 '交通': (4, 4, 1, 0.3), '環境': (3, 4, 1.5, 0.3), '長照': (0.5, 4, 1.5, 1.5), '育兒': (0.5, 3, 2, 2),
 '觀光': (0.3, 1, 3, 2.5), '文化': (0.2, 1, 3, 3), '其他': (0, 0, 0, 1),
}

rows = []
for i, (code, name) in enumerate(villages):
    dominant = ISSUES[i % len(ISSUES)] if i < 12 else random.choice(ISSUES[:4])
    weights = {c: 1.0 for c in ISSUES}
    weights[dominant] = 4.0
    weights['其他'] = 1.6
    n = random.randint(8, 18)
    used = set()
    for _ in range(n):
        cats = list(weights)
        cat = random.choices(cats, [weights[c] for c in cats])[0]
        pool = [t for t in T[cat] if (cat, t) not in used] or T[cat]
        t = random.choice(pool)
        used.add((cat, t))
        mood = random.choices(['angry', 'worried', 'neutral', 'happy'], MOODS[cat])[0]
        rows.append((code, name, cat, mood, t.replace('{v}', name)))

random.shuffle(rows)
no = 1000 + len(rows) * 3
lines = []
for code, name, cat, mood, text in rows:
    lines.append(f"  {{ no: {no}, village: '{code}', category: '{cat}', mood: '{mood}', text: '{text}' }}, // {name}")
    no -= random.randint(1, 4)

src = open('src/data/mockFeedback.ts').read().split('/** 新到舊排序 */')[0] + '''/** 新到舊排序 */
export const mockFeedback: MockFeedback[] = [
''' + '\n'.join(lines) + '\n]\n'
open('src/data/mockFeedback.ts', 'w').write(src)
print(len(rows), 'entries')
