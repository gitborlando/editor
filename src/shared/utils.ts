import { v4 } from 'uuid'

export const This = globalThis as any
export const uuid = v4

export type INoopFunc = typeof noopFunc
export function noopFunc() {}

export type IXY = { x: number; y: number }
export type IBound = IXY & { width: number; height: number }
export type ICursor = 'auto' | 'n-resize' | 'e-resize' | 'grab' | (string & {})

export function createBound(x: number, y: number, width: number, height: number) {
  return { x, y, width, height }
}

export function withNewFunction(body: string) {
  return new Function('target', `with(target){${body}}`)
}

export function stringPathProxy(target: any) {
  function get(_: any, key: string) {
    return withNewFunction(
      `return ${key}?.constructor.name === 'ObservableSet2' ? ${key}.values() : ${key}`
    )(target)
  }
  return new Proxy({}, { get })
}
export function Delete<T>(object: Record<string, T>, key: string): void
export function Delete<T>(target: T[], find: string | ((value: T) => void)): void
export function Delete<T>(target: Record<string, T> | T[], filter: string | ((value: T) => void)) {
  if (Array.isArray(target)) {
    const index =
      typeof filter === 'function'
        ? target.findIndex(filter)
        : target.findIndex((i) => i === filter)
    index >= 0 && target.splice(index, 1)
  } else {
    delete target[filter as string]
  }
}

export function hierarchyUp<T>(target: T[], filter: string | ((value: T) => void)) {
  const index =
    typeof filter === 'function' ? target.findIndex(filter) : target.findIndex((i) => i === filter)
  if (index <= 0) return
  ;[target[index - 1], target[index]] = [target[index], target[index - 1]]
}
export function hierarchyDown<T>(target: T[], filter: string | ((value: T) => void)) {
  const index =
    typeof filter === 'function' ? target.findIndex(filter) : target.findIndex((i) => i === filter)
  if (index >= target.length - 1) return
  ;[target[index], target[index + 1]] = [target[index + 1], target[index]]
}

export function pipe<T>(raw: T) {
  return {
    to: (...funcs: ((arg: T) => T)[]) => {
      return funcs.reduce((res, func) => (res = func(res)), raw)
    },
  }
}

export function cullNegatives<T>(..._values: (T | undefined | null | false)[]) {
  const values: T[] = []
  _values.forEach((i) => {
    if (i !== undefined && i !== false && i !== null && !Number.isNaN(i)) values.push(i)
  })
  return values
}

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

export function timeRecord() {
  let all = 0
  let start = performance.now()
  return {
    every: (text?: any) => {
      const shift = performance.now() - start
      all += shift
      text && console.log(text, shift)
      start = performance.now()
      return shift
    },
    all: (text?: any) => {
      const shift = performance.now() - start
      all += shift
      console.log(text, all)
    },
  }
}

export function Log<T>(someThing: T, label: string = '') {
  console.log(label, someThing)
  return someThing
}

let count = 0
export function once(fn: () => void, _count = 1) {
  if (count >= _count) return
  fn()
  count++
}
export function onceLog(...args: any[]) {
  once(() => console.log(...args), 1)
}
