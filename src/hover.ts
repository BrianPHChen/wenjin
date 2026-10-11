import type { FocusEvent, PointerEvent } from 'react'

/**
 * 只對滑鼠觸發 hover。觸控裝置若在 hover 時改動畫面（例如村浮起），
 * iOS Safari 會把第一次點擊當成 hover 而吞掉 click，所以觸控直接略過 hover。
 * 鍵盤聚焦（:focus-visible）也視為 hover，讓 Tab 瀏覽時一樣有浮起提示。
 */
export function hoverProps(code: string, onHover: (code: string | null) => void) {
  return {
    onPointerEnter: (e: PointerEvent) => e.pointerType === 'mouse' && onHover(code),
    onPointerLeave: (e: PointerEvent) => e.pointerType === 'mouse' && onHover(null),
  }
}

export function focusHoverProps(code: string, onHover: (code: string | null) => void) {
  return {
    onFocus: (e: FocusEvent<Element>) => e.currentTarget.matches(':focus-visible') && onHover(code),
    onBlur: () => onHover(null),
  }
}
