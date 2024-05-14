import fastDeepEqual from 'deep-equal'
import { runInAction } from 'mobx'
import { FC, memo, useCallback, useEffect } from 'react'
import { xy_, xy_rotate } from '~/editor/math/xy'
import { INode } from '~/editor/schema/type'
import { createCache } from '../cache'

export const This = globalThis as any
export { fastDeepEqual }

export type INoopFunc = typeof noopFunc
export function noopFunc() {}

export type IAnyFunc = typeof anyFunc
export function anyFunc(...args: any[]): any {}

export type IAnyObject = Record<string, any>
export const AnyObject = <IAnyObject>{}

export type ValueOf<T extends Record<string, any>> = T[keyof T]

export type AllKeys<T extends Record<string, any>> = T extends Record<string, any>
  ? T extends any[]
    ? never
    : keyof T | { [K in keyof T]: AllKeys<T[K]> }[keyof T]
  : never

export type IXY = { x: number; y: number }
export type IRect = IXY & { width: number; height: number }
export type IBound = {
  left: number
  right: number
  top: number
  bottom: number
  centerX: number
  centerY: number
}
export type ICursor = 'auto' | 'n-resize' | 'e-resize' | 'grab' | (string & {})

export function createBound(x: number, y: number, width: number, height: number) {
  return { x, y, width, height }
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

export function makeAction<T extends any>(callback?: (...args: T[]) => void) {
  return (...args: T[]) => runInAction(() => callback?.(...args))
}

export function iife<T extends any = any>(callback: () => T): T {
  return callback()
}

export function isNumberEqual(a: number, b: number) {
  return Math.abs(a - b) < 0.00001
}

export function once<T extends any[]>(fn?: (...args: T) => void) {
  return (...args: T) => {
    fn?.(...args)
    fn = undefined
  }
}

export function useAsyncEffect(callback: Function, deps = []) {
  useEffect(() => void (async () => callback())(), deps)
}

export function useSubComponent<P extends {}>(deps: any[], component: FC<P>) {
  return useCallback(component, deps)
}

export function useMemoSubComponent<P extends {}>(deps: any[], component: FC<P>) {
  return useCallback(memo(component), deps)
}

export function Log<T>(someThing: T, label: string = '') {
  console.log(label, someThing)
  return someThing
}

const rafThrottleCache = createCache<any, boolean>()
export function rafThrottle(id: any, callback: () => void) {
  const ticking = rafThrottleCache.getSet(id, () => false)
  if (ticking) return
  rafThrottleCache.set(id, true)
  requestAnimationFrame(() => {
    callback()
    rafThrottleCache.set(id, false)
  })
}

const memorizeMap = createCache<string, { value: any; compare: any[] }>()
export function memorize<T>(id: string, compare: any[], callback: () => T): T {
  const cache = memorizeMap.getSet(id, () => ({ value: undefined, compare: [] }))
  if (!cache.value) {
    cache.value = callback()
    cache.compare = compare
    return cache.value
  }
  for (let i = 0; i < compare.length; i++) {
    if (compare[i] !== cache.compare[i]) {
      cache.value = callback()
      cache.compare = compare
      return cache.value
    }
  }
  return cache.value
}

export function fps() {
  //@ts-ignore
  const meter = new FPSMeter(document.getElementById('fps'), { graph: 3 })
  const loop = () => {
    meter.tick()
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
}

export function getNodeCenterXY(node: INode) {
  const { x, y, width, height } = node
  return xy_rotate(xy_(x + width / 2, y + height / 2), xy_(x, y), node.rotation)
}

export function favIcon(href: string) {
  const head = document.querySelector<HTMLHeadElement>('head')!
  const link = document.createElement('link')
  link.setAttribute('rel', 'shortcut icon')
  link.setAttribute('href', href)
  head.appendChild(link)
}
