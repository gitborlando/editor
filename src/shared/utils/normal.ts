import fastDeepEqual from 'deep-equal'
import { runInAction } from 'mobx'
import { FC, memo, useCallback, useEffect } from 'react'

export const This = globalThis as any
export { fastDeepEqual }

export type INoopFunc = typeof noopFunc
export function noopFunc() {}

export type IAnyFunc = typeof anyFunc
export function anyFunc(...args: any[]): any {}

export type IAnyObject = Record<string, any>
export const AnyObject = <IAnyObject>{}

export type ValueOf<T extends Record<string, any>> = T[keyof T]

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
export function Delete<T>(target: T[], find: string | ((value: T) => void)): number
export function Delete<T>(
  target: Record<string, T> | T[],
  filter: string | ((value: T) => void | number)
) {
  if (Array.isArray(target)) {
    const index =
      typeof filter === 'function'
        ? target.findIndex(filter)
        : target.findIndex((i) => i === filter)
    index >= 0 && target.splice(index, 1)
    return index
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

export function ObjectGetSet(obj: any, keys: (string | number)[], value?: any) {
  if (keys.length === 0)
    keys.forEach((key, i) => {
      if (value !== undefined && i === keys.length - 1) {
        obj[key] = value
      }
      obj = obj[key]
    })
  return obj
}
