import { INoopFunc } from './normal'

export function firstOne<T extends any = any>(input: T[] | Set<T>) {
  return [...input][0]
}
export function lastOne<T extends any = any>(input: T[] | Set<T>) {
  const arr = [...input]
  return arr[arr.length - 1]
}

export function flushFuncs<T extends INoopFunc>(input: T[] | Set<T>) {
  input.forEach((callback) => callback())
  Array.isArray(input) ? (input.length = 0) : input.clear()
}

export function stableIndex<T extends any = any>(arr: T[], index?: number) {
  if (index === undefined) return arr.length
  if (index < 0) return 0
  if (index > arr.length) return arr.length
  return index
}

export function loopFor<T>(arr: T[], callback: (cur: T, next: T, last: T, index: number) => any) {
  for (let index = 0; index < arr.length; index++) {
    const left = index === 0 ? arr.length - 1 : index - 1
    const right = index === arr.length - 1 ? 0 : index + 1
    const res = callback(arr[index], arr[right], arr[left], index)
    if (res === true) break
    if (res === false) continue
  }
}

export function reverseFor<T>(items: T[], callback: (item: T, index: number) => any) {
  for (let i = items.length - 1; i >= 0; i--) callback(items[i], i)
}

export function reverse<T extends any>(arr: T[]) {
  return arr.slice().reverse()
}
