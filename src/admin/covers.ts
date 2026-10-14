// 影片封面：在瀏覽器裡把截圖裁成直式 9:16、縮小壓縮，再上傳到 Firebase Storage 的 covers/

import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'
import { app } from '../firebase'

const WIDTH = 540
const HEIGHT = 960
const storage = getStorage(app)

/** 置中裁切成 9:16（手機截圖上下的狀態列、黑邊會被裁掉一部分），輸出約 60–120 KB 的 JPEG */
export async function makeCover(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const target = WIDTH / HEIGHT
  let sw = bitmap.width
  let sh = bitmap.height
  if (sw / sh > target) sw = sh * target
  else sh = sw / target
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  canvas.getContext('2d')!.drawImage(bitmap, (bitmap.width - sw) / 2, (bitmap.height - sh) / 2, sw, sh, 0, 0, WIDTH, HEIGHT)
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('圖片轉換失敗'))), 'image/jpeg', 0.82),
  )
}

/** 檔名帶時間，換封面時網址會變，瀏覽器快取不會卡在舊圖 */
export async function uploadCover(code: string, blob: Blob): Promise<string> {
  const r = ref(storage, `covers/${code}-${Date.now()}.jpg`)
  await uploadBytes(r, blob, { contentType: 'image/jpeg', cacheControl: 'public, max-age=31536000, immutable' })
  return getDownloadURL(r)
}

/** 刪除舊封面；失敗不影響影片清單 */
export async function deleteCover(url: string | undefined) {
  if (!url) return
  try {
    await deleteObject(ref(storage, url))
  } catch (e) {
    console.warn('刪除舊封面失敗', e)
  }
}
