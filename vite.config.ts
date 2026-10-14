import { defineConfig, type Connect, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

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

// base: './' 讓 dist/ 可直接放到任何子路徑或用 file:// 開啟
export default defineConfig({
  plugins: [react(), cleanUrls()],
  base: './',
})
