import { runInAction } from 'mobx'

export const This = globalThis as any

export const isLeftMouse = (e: any): e is MouseEvent => e.button === 0
export const isRightMouse = (e: any): e is MouseEvent => e.button === 2

export type INoopFunc = typeof noopFunc
export function noopFunc() {}

export type IAnyFunc = typeof anyFunc
export function anyFunc(...args: any[]): any {}

export type ValueOf<T extends Record<string, any>> = T[keyof T]

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

export function objEntries<T extends Record<string, any>, K extends keyof T = keyof T>(
  obj: T,
  callback: (key: K, val: T[K], i: number) => void
) {
  Object.entries(obj).forEach(([key, val], i) => callback(key as K, val, i))
}

export function stopPropagation(e: any) {
  e.stopPropagation()
}

export function makeAction<T extends any>(callback?: (...args: T[]) => void) {
  return (...args: T[]) => {
    runInAction(() => callback?.(...args))
  }
}

export function iife<T extends any = any>(callback: () => T): T {
  return callback()
}
