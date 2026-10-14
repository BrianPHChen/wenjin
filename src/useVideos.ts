import { doc, getDoc } from 'firebase/firestore/lite'
import { useEffect, useState } from 'react'
import { byNewest, type Video } from './data/social'
import { db } from './firebase'

export const videosDoc = doc(db, 'site', 'videos')

/** null = 載入中 */
export function useVideos(): Video[] | null {
  const [videos, setVideos] = useState<Video[] | null>(null)
  useEffect(() => {
    getDoc(videosDoc)
      .then((d) => setVideos(((d.data()?.items ?? []) as Video[]).sort(byNewest)))
      .catch((e) => {
        console.error('載入影片失敗', e)
        setVideos([])
      })
  }, [])
  return videos
}
