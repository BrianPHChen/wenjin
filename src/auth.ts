// 登入與呼叫後端。只在打開表單或審核頁時才載入（Firebase Auth、LIFF SDK 都不小）。

import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCustomToken,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions'
import { useEffect, useState } from 'react'
import { app, LIFF_ID, LINE_PENDING_KEY, REGION, USE_EMULATORS } from './firebase'

export const auth = getAuth(app)
const functions = getFunctions(app, REGION)
if (USE_EMULATORS) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFunctionsEmulator(functions, '127.0.0.1', 5001)
}

const ua = navigator.userAgent
export const isLineApp = /\bLine\//i.test(ua)
/** Google 不允許在 App 內建瀏覽器登入（會出現 403 disallowed_useragent） */
export const isInAppBrowser = isLineApp || /FBAN|FBAV|FB_IAB|Instagram|MicroMessenger/i.test(ua)
export const lineEnabled = !!LIFF_ID

export function call<Req, Res>(name: string) {
  const fn = httpsCallable<Req, Res>(functions, name)
  return async (data: Req) => (await fn(data)).data
}

/** undefined = 還在確認登入狀態 */
export function useUser(): User | null | undefined {
  const [user, setUser] = useState<User | null | undefined>(auth.currentUser ?? undefined)
  useEffect(() => onAuthStateChanged(auth, setUser), [])
  return user
}

export async function loginWithGoogle() {
  await signInWithPopup(auth, new GoogleAuthProvider())
}

async function initLiff() {
  const liff = (await import('@line/liff')).default
  await liff.init({ liffId: LIFF_ID })
  return liff
}

async function finishLine(liff: Awaited<ReturnType<typeof initLiff>>) {
  const idToken = liff.getIDToken()
  if (!idToken) throw new Error('沒有拿到 LINE 憑證，請再試一次')
  const { token } = await call<{ idToken: string }, { token: string }>('lineLogin')({ idToken })
  await signInWithCustomToken(auth, token)
}

/** 在 LINE 裡通常直接完成；在一般瀏覽器會整頁跳到 LINE 登入頁，回來後由 resumeLineLogin 接手 */
export async function loginWithLine() {
  const liff = await initLiff()
  if (liff.isLoggedIn()) return finishLine(liff)
  try {
    sessionStorage.setItem(LINE_PENDING_KEY, '1')
  } catch {
    // 無痕模式等情況存不了，回來後再按一次登入即可
  }
  liff.login({ redirectUri: location.href })
  return new Promise<never>(() => {}) // 頁面即將跳轉
}

/** 從 LINE 登入頁跳回來時呼叫；回傳是否完成登入 */
export async function resumeLineLogin(): Promise<boolean> {
  try {
    if (!sessionStorage.getItem(LINE_PENDING_KEY)) return false
    sessionStorage.removeItem(LINE_PENDING_KEY)
  } catch {
    return false
  }
  if (!lineEnabled) return false
  const liff = await initLiff()
  if (!liff.isLoggedIn()) return false
  await finishLine(liff)
  return true
}

export function logout() {
  return signOut(auth)
}

/** Firebase callable 的錯誤訊息（後端已寫成中文） */
export function errorMessage(e: unknown): string {
  const err = e as { code?: string; message?: string }
  if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return ''
  if (err.code === 'auth/popup-blocked') return '登入視窗被瀏覽器擋下了，請允許彈出視窗後再試一次'
  if (err.code?.startsWith('functions/') && err.message && err.code !== 'functions/internal') return err.message
  return '發生錯誤，請稍後再試'
}
