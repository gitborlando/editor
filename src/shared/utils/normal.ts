import { createCache } from './cache'

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
  const head = document.querySelector<HTMLHeadElement>('head')!
  const link = document.createElement('link')
  link.setAttribute('rel', 'shortcut icon')
  link.setAttribute('href', href)
  head.appendChild(link)
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

const cache = createCache()
export function macro_match(_input: TemplateStringsArray) {
  const input = _input[0]
  const test: any = cache.getSet(input, () => {
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

export function timeFor(count: number, func: (i: number) => any, name?: string) {
  console.time(name || `${count}`)
  for (let i = 0; i < count; i++) func(i)
  console.timeEnd(name || `${count}`)
}

export function notUndefine<T extends any>(val: T | undefined): val is T {
  return val !== undefined
}
