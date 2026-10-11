import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' 讓 dist/ 可直接放到任何子路徑或用 file:// 開啟
export default defineConfig({
  plugins: [react()],
  base: './',
})
