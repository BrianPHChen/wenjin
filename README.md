# 吳文進｜壯圍鄉長候選人 — 互動地圖網站

React + Vite + d3-geo 靜態網頁。點選村會以 SVG 假 3D 浮起，周圍卡片切換為該村數據。

```bash
npm install
npm run dev      # 開發
npm run build    # 產出 dist/，可直接部署到任何靜態主機
```

## 資料

- `src/data/zhuangwei.json` — 壯圍鄉 16 村界 GeoJSON（由 `../村里界歷史圖資_114/VILLAGE_NLSC_11401031.shp` 擷取）。
  重新產生：`python3 scripts/extract.py ../村里界歷史圖資_114/VILLAGE_NLSC_11401031 src/data/zhuangwei.json`
- `src/data/feedback.ts` — 鄉親建言，**目前是 mock 資料**（由 `python3 scripts/gen_feedback.py` 產生）。換成真實資料後把 `FEEDBACK_PLACEHOLDER` 改成 `false`；有表單後把連結填進 `FEEDBACK_FORM_URL`。
  類別「其他」視為支持留言，不列入議題統計。
- `src/feedbackStats.ts` — 由建言算出總數、支持留言、議題排名、情緒分布、各村最在意議題（平手以最新一則為準）。
- `src/data/policies.ts` — 政見；`issue` 欄位讓「三大關注議題」連到對應政見。

網址加 `#村代碼`（例如 `#10002060013`）可直接開啟某一村。
