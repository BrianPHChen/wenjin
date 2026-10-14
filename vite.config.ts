import { defineConfig, type Connect, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { policies, slogan } from './src/data/policies'
import { SOCIAL } from './src/data/social'

// 線上 Firebase Hosting 開了 cleanUrls（/privacy → privacy.html）；本機 dev / preview 也照做
const cleanUrl: Connect.NextHandleFunction = (req, _res, next) => {
  if (req.url === '/privacy' || req.url?.startsWith('/privacy?')) req.url = req.url.replace('/privacy', '/privacy.html')
  next()
}
const cleanUrls = (): Plugin => ({
  name: 'clean-urls',
  configureServer: (server) => void server.middlewares.use(cleanUrl),
  configurePreviewServer: (server) => void server.middlewares.use(cleanUrl),
})

// 搜尋引擎用：網站說明、結構化資料、首頁靜態文字，內容都取自 src/data，跟網站同步
const SITE = 'https://wenjin.tw/'
const DESCRIPTION =
  `吳文進，宜蘭縣壯圍鄉長候選人。「${slogan.join(' ')}」六大政見：${policies.map((p) => p.title).join('；')}。` +
  '看壯圍 16 村鄉親建言地圖，留下你對壯圍的意見。'
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${SITE}#wenjin`,
      name: '吳文進',
      alternateName: '文進',
      description: '宜蘭縣壯圍鄉長候選人',
      url: SITE,
      image: `${SITE}og.jpg`,
      homeLocation: { '@type': 'Place', name: '宜蘭縣壯圍鄉' },
      sameAs: [SOCIAL.instagram, SOCIAL.facebook],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}#site`,
      name: '吳文進｜壯圍鄉長候選人',
      alternateName: ['吳文進', '文進 wenjin'],
      url: SITE,
      inLanguage: 'zh-Hant-TW',
      about: { '@id': `${SITE}#wenjin` },
    },
  ],
}
const prerender = `
<div class="page">
  <header class="masthead">
    <p class="eyebrow">宜蘭縣 · 壯圍鄉</p>
    <h1><span class="mh-name">吳文進</span><span class="mh-sep" aria-hidden="true">｜</span><span class="mh-role">壯圍鄉長候選人</span></h1>
    <p class="lede">${esc(slogan.join(' '))}</p>
  </header>
  <section class="prerender">
    <h2>六大政見</h2>
    ${policies.map((p) => `<h3>${esc(p.title)}</h3><ul>${p.points.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`).join('\n    ')}
  </section>
</div>`
const seo = (): Plugin => ({
  name: 'seo',
  transformIndexHtml: (html) =>
    html
      .replaceAll('%DESCRIPTION%', esc(DESCRIPTION))
      .replace('<!--structured-data-->', `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`)
      .replace('<!--prerender-->', prerender),
})

// base: './' 讓 dist/ 可直接放到任何子路徑或用 file:// 開啟
export default defineConfig({
  plugins: [react(), cleanUrls(), seo()],
  base: './',
})
