import camelCase from 'camelcase'
import { createObjCache } from './cache'

export { camelCase }

export const This = globalThis as any

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

export function favIcon(href: string) {
  const link = document.createElement('link')
  link.setAttribute('rel', 'shortcut icon')
  link.setAttribute('href', href)
  document.head.appendChild(link)
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

export function iife<T extends any = any>(callback: () => T): T {
  return callback()
}

export function matchCase<T extends string, R extends any>(Case: T, obj: Record<T, R>) {
  return obj[Case]
}

export function isNumberEqual(a: number, b: number) {
  return Math.abs(a - b) < 0.00001
}

export function Log<T>(someThing: T, label: string = '') {
  console.log(label, someThing)
  return someThing
}

export function cx(...args: (string | undefined)[]): string
export function cx(...args: ([boolean, string] | [string])[]): string
export function cx(...args: ((string | undefined) | [boolean, string] | [string])[]) {
  const array = args.filter(Boolean) as (string | [boolean, string] | [string])[]

  if (typeof array[0] === 'string') return array.join(' ')

  let res = ''
  for (const [condition, className] of array) {
    if (className === undefined) res += condition + ' '
    if (condition === true) return (res += className !== '' ? `${className} ` : '')
  }
  return res.trim()
}

const macroMatchCache = createObjCache()
export function macroMatch(_input: TemplateStringsArray) {
  const input = _input[0]
  const test: any = macroMatchCache.getSet(input, () => {
    const right = input.trimStart().trimEnd().split('|')
    return new Function(
      'left',
      right.reduce((all, i) => {
        return `if(left === ${i})return true;` + all
      }, 'return false;')
    )
  })
  return (left: any) => test(left)
}

export function clone<T extends any>(object: T): T {
  if (typeof object !== 'object') return object
  const newObj: any = Array.isArray(object) ? [] : {}
  for (const key in object) newObj[key] = clone(object[key])
  return newObj
}

export function timeOf(count: number, func: (i: number) => any, count2 = 1, skip = 0) {
  let all = 0
  for (let i = 0; i < count2; i++) {
    const start = performance.now()
    for (let i = 0; i < count; i++) func(i)
    const end = performance.now()
    if (i >= skip) all += end - start
  }
  console.log(
    `${count}`,
    `all: ${all}ms`,
    `aver: ${(all / count / (count2 - skip)).toExponential()}ms`
  )
}

export function notUndefine<T extends any>(val: T | undefined): val is T {
  return val !== undefined
}

export function jsonFy(obj: any) {
  return JSON.stringify(obj, null, 2)
}

export function memorize<T extends any[], R extends any>(func: (...args: T) => R) {
  const cache = createObjCache<R>()
  return (...args: T) => {
    const key = args.join('-')
    return cache.getSet(key, () => func(...args))
  }
}

export function debounce<T extends any[], R extends any>(wait: number, func: (...args: T) => R) {
  let timeout: any
  return (...args: T) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
