import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { lazy, Suspense } from 'react'
import App from './App'
import { FeedbackProvider } from './feedbackStore'
import './styles.css'

// 審核頁：網址加 #/admin
const isAdmin = location.hash === '#/admin'
const Admin = lazy(() => import('./admin/Admin'))
// 只改 hash 瀏覽器不會重新載入；進出審核頁時手動重載
window.addEventListener('hashchange', () => {
  if ((location.hash === '#/admin') !== isAdmin) location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
    ) : (
      <FeedbackProvider>
        <App />
      </FeedbackProvider>
    )}
  </StrictMode>,
)
