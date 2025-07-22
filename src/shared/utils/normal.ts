import { Is } from '@gitborlando/utils'
import camelCase from 'camelcase'

export { camelCase }

export {
  clone,
  debounce,
  Delete,
  iife,
  jsonFy,
  jsonParse,
  Log,
  macroMatch,
  matchCase,
  memorize,
  Raf,
  This,
  type AllKeys,
  type ValueOf,
} from '@gitborlando/utils'

export const dpr = devicePixelRatio

export type INoopFunc = typeof noopFunc
export function noopFunc() {}

export type IAnyFunc = typeof anyFunc
export function anyFunc(...args: any[]): any {}

export type IAnyObject = Record<string, any>
export const AnyObject = <IAnyObject>{}

export type IXY = { x: number; y: number }
export type IRect = IXY & { width: number; height: number }

export function isNumberEqual(a: number, b: number) {
  return Math.abs(a - b) < 0.00001
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
    `aver: ${(all / count / (count2 - skip)).toExponential()}ms`,
  )
}

export function getTime() {
  return new Date().getTime()
}

export function publicPath(path: string) {
  return import.meta.env.DEV ? `./editor/${path}` : `./${path}`
}

export function optionalSet<T>(target: T | undefined | null, key: keyof T, value: T[keyof T]) {
  if (Is.nullable(target)) return
  target[key] = value
}
