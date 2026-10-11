# 壯圍十六村互動地圖

React + Vite + d3-geo 靜態網頁。點選村會以 SVG 假 3D 浮起，周圍卡片切換為該村數據。

```bash
npm install
npm run dev      # 開發
npm run build    # 產出 dist/，可直接部署到任何靜態主機
```

## 資料

- `src/data/zhuangwei.json` — 壯圍鄉 16 村界 GeoJSON（由 `../村里界歷史圖資_114/VILLAGE_NLSC_11401031.shp` 擷取）。
  重新產生：`python3 scripts/extract.py ../村里界歷史圖資_114/VILLAGE_NLSC_11401031 src/data/zhuangwei.json`
- `src/data/villageStats.ts` — **目前是假資料**。換成真實數據後，把 `IS_PLACEHOLDER` 改成 `false` 即可移除「示意資料」標示。
- 面積由圖資實際計算；全鄉數據為 16 村加總；性別比、老化指數、戶量、密度自動推算（`src/stats.ts`）。

網址加 `#村代碼`（例如 `#10002060013`）可直接開啟某一村。
