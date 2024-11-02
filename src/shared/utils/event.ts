import { useEffect } from 'react'
import { INoopFunc } from './normal'

export type IClientXY = { clientX: number; clientY: number }

export const isLeftMouse = (e: MouseEvent) => e.button === 0
export const isRightMouse = (e: MouseEvent) => e.button === 2

export function listen<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any
) {
  window.addEventListener(type, listener)
  return () => window.removeEventListener(type, listener)
}

export function listenOnce<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any
) {
  const once = (ev: WindowEventMap[K]) => {
    listener.call(window, ev)
    window.removeEventListener(type, once)
  }
  window.addEventListener(type, once)
}

export function listenCapture<K extends keyof WindowEventMap>(
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
  return listenCapture('mousedown', (e) => {
    if (!when()) return
    if (!clickInside(e, insideTest)) callback()
  })
}
export function useClickAway(props: IClickAwayProps) {
  useEffect(() => clickAway(props), [])
}

export function downUpTracker(
  el: HTMLElement | null,
  _downCallback: INoopFunc,
  _upCallback: INoopFunc
) {
  if (!el) return
  const downCallback = () => {
    _downCallback()
    window.addEventListener('mouseup', upCallback)
  }
  const upCallback = () => {
    _upCallback()
    window.removeEventListener('mouseup', upCallback)
  }
  el.addEventListener('mousedown', downCallback)
  return () => el.removeEventListener('mousedown', downCallback)
}

export function useDownUpTracker(
  elCallback: () => HTMLElement | null,
  downCallback: INoopFunc,
  upCallback: INoopFunc,
  deps: any[] = []
) {
  useEffect(() => downUpTracker(elCallback(), downCallback, upCallback), deps)
}

export function disableDefaultTwoFingerEvent() {
  window.addEventListener('wheel', (e) => e.preventDefault(), { passive: false })
}
