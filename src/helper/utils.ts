import { IAutorunOptions, IReactionPublic, autorun } from 'mobx'
import { useEffect } from 'react'

export type IXY = { x: number; y: number }

export type INoopFunc = typeof noopFunc
export function noopFunc() {}

export type ICursor = 'auto' | 'n-resize' | 'e-resize' | 'grab' | (string & {})

export const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<F>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

export const throttleAnimationFrame = <F extends (...args: any[]) => any>(callback: F) => {
  let requestId: number | null = null
  let previousTime = 0
  return (...args: Parameters<F>) => {
    const currentTime = performance.now()
    if (currentTime - previousTime <= 16) return
    if (requestId) cancelAnimationFrame(requestId)
    requestId = requestAnimationFrame(() => {
      callback(...args)
      previousTime = currentTime
    })
  }
}

export function listen<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
) {
  window.addEventListener(
    type,
    (e) => {
      requestAnimationFrame(() => {
        listener.call(window, e)
      })
    },
    options
  )
}

export function useAutoRun(view: (r: IReactionPublic) => any, opts?: IAutorunOptions) {
  useEffect(() => {
    const disposer = autorun(view, opts)
    return () => disposer()
  }, [])
}

export function randomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`
}

export function Delete<T>(object: Record<string, T>, key: string): void
export function Delete<T>(target: T[], find: (value: T) => void): void
export function Delete<T>(target: Record<string, T> | T[], filter: string | ((value: T) => void)) {
  if (Array.isArray(target)) {
    const index = target.findIndex(filter as (value: T) => void)
    index >= 0 && target.splice(index, 1)
  } else {
    delete target[filter as string]
  }
}

// 弧度到角度
export function radiansToDegrees(radians: number) {
  return radians * (180 / Math.PI)
}
// 角度到弧度
export function degreesToRadians(degrees: number) {
  return degrees * (Math.PI / 180)
}
export const radianfy = degreesToRadians
