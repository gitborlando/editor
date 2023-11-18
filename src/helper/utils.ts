import { IAutorunOptions, IReactionPublic, autorun } from 'mobx'
import { useEffect } from 'react'

export type INoopFunc = typeof noopFunc
export function noopFunc() {}

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

export function documentCreateElement<Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  option: { parent: HTMLElement | string; innerHTML?: any } & Partial<CSSStyleDeclaration>
): HTMLElementTagNameMap[Tag] {
  const element = document.createElement(tag) as any
  Object.entries(option).forEach(([key, value]) => {
    if (key === 'parent') return
    if (['id', 'className', 'innerHTML'].includes(key)) {
      element[key] = value
    } else {
      element.style[key] = value
    }
  })
  const { parent } = option
  if (typeof parent !== 'string') {
    parent.appendChild(element)
  } else {
    document.querySelector(parent)?.appendChild(element)
  }
  return element
}
