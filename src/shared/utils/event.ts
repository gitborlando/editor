import { useEffect } from 'react'

export const isLeftMouse = (e: any): e is MouseEvent => e.button === 0
export const isRightMouse = (e: any): e is MouseEvent => e.button === 2

export function addListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any
) {
  window.addEventListener(type, listener)
  return () => window.removeEventListener(type, listener)
}

export function addListenerCapture<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any
) {
  window.addEventListener(type, listener, true)
  return () => window.removeEventListener(type, listener, true)
}

export function stopPropagation(callback?: (e?: any) => any) {
  return (e: any) => {
    callback?.(e)
    e.stopPropagation()
  }
}
export function preventDefault(callback?: (e?: any) => any) {
  return (e: any) => {
    callback?.(e)
    e.preventDefault()
  }
}

export function clickInside(e: MouseEvent, insideTest: (dom?: Element) => any) {
  let dom = document.elementFromPoint(e.clientX, e.clientY)
  while (dom) {
    if (insideTest(dom)) return true
    dom = dom.parentElement
  }
  return false
}
type IClickAwayProps = {
  when: () => boolean
  insideTest: (dom?: Element) => any
  callback: () => void
}
export function clickAway({ when, insideTest, callback }: IClickAwayProps) {
  return addListenerCapture('mousedown', (e) => {
    if (!when()) return
    if (!clickInside(e, insideTest)) callback()
  })
}
export function useClickAway(props: IClickAwayProps) {
  useEffect(() => clickAway(props), [])
}
