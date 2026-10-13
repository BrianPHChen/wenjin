import { initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore/lite'

// Firebase 網頁設定不是密碼，可以公開；權限由 firestore.rules 與 Cloud Functions 控管
export const app = initializeApp({
  apiKey: 'AIzaSyAKncRjyaLdaAQVmWln71pYlQNrdlBcxTc',
  authDomain: 'wenjin-c1557.firebaseapp.com',
  projectId: 'wenjin-c1557',
  storageBucket: 'wenjin-c1557.firebasestorage.app',
  messagingSenderId: '724856301138',
  appId: '1:724856301138:web:397b62ee22679fed04a18b',
})

export const db = getFirestore(app)
export const REGION = 'asia-east1'

/** LINE Developers → LINE Login channel → LIFF 的 LIFF ID；留空則不顯示 LINE 登入 */
export const LIFF_ID = ''

/** 個資告知版本；改了告知內容就要改這裡和 functions/src/index.ts 的 CONSENT_VERSION */
export const CONSENT_VERSION = '2026-10-13'

/** npm run dev:emu 時連本機模擬器 */
export const USE_EMULATORS = import.meta.env.VITE_EMULATORS === '1'
if (USE_EMULATORS) connectFirestoreEmulator(db, '127.0.0.1', 8080)

/** LINE 登入整頁跳轉前留下的記號，回來時自動打開表單完成登入 */
export const LINE_PENDING_KEY = 'wj-line-login'
