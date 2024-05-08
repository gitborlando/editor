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
