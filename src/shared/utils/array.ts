export function firstOne<T extends any = any>(input: T[] | Set<T>) {
  return [...input][0]
}
export function lastOne<T extends any = any>(input: T[] | Set<T>) {
  const arr = [...input]
  return arr[arr.length - 1]
}

export function stableIndex<T extends any = any>(arr: T[], index?: number) {
  if (index === undefined) return arr.length
  if (index < 0) return 0
  if (index > arr.length) return arr.length
  return index
}

export const BREAK = 'break'

export function loopFor<T>(arr: T[], callback: (cur: T, next: T, last: T, index: number) => any) {
  for (let index = 0; index < arr.length; index++) {
    const left = index === 0 ? arr.length - 1 : index - 1
    const right = index === arr.length - 1 ? 0 : index + 1
    const res = callback(arr[index], arr[right], arr[left], index)
    if (res === BREAK) break
  }
}
