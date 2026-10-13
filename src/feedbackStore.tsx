import { collection, getDocs } from 'firebase/firestore/lite'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Feedback } from './data/feedback'
import { db } from './firebase'
import { buildFeedbackData, type FeedbackData, type FeedbackStats } from './feedbackStats'

interface Store extends FeedbackData {
  status: 'loading' | 'ready' | 'error'
  /** 新到舊 */
  items: Feedback[]
  /** 有示意資料時顯示「示意」標籤 */
  hasMock: boolean
  statsFor: (code: string | null) => FeedbackStats
}

const FeedbackContext = createContext<Store | null>(null)

/** 一次讀完 publicFeed（每份文件存數百則留言），統計都在前端算，每位訪客只花幾次讀取 */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Store['status']>('loading')
  const [items, setItems] = useState<Feedback[]>([])

  useEffect(() => {
    getDocs(collection(db, 'publicFeed'))
      .then((snap) => {
        const all = snap.docs.flatMap((d) => (d.data().items ?? []) as Feedback[])
        setItems(all.sort((a, b) => b.at - a.at))
        setStatus('ready')
      })
      .catch((e) => {
        console.error('載入留言失敗', e)
        setStatus('error')
      })
  }, [])

  const store = useMemo<Store>(() => {
    const data = buildFeedbackData(items)
    return {
      ...data,
      status,
      items,
      hasMock: items.some((f) => f.mock),
      statsFor: (code) => (code && data.villages[code]) || data.township,
    }
  }, [items, status])

  return <FeedbackContext.Provider value={store}>{children}</FeedbackContext.Provider>
}

export function useFeedback(): Store {
  const store = useContext(FeedbackContext)
  if (!store) throw new Error('useFeedback 必須在 FeedbackProvider 裡使用')
  return store
}
