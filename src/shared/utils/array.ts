export function firstOne<T extends any = any>(input: T[] | Set<T>) {
  return [...input][0]
}
export function lastOne<T extends any = any>(input: T[] | Set<T>) {
  const arr = [...input]
  return arr[arr.length - 1]
}

export function insertAt<T>(array: T[], index: number, item: T) {
  if (index < 0) return array.unshift(item)
  if (index > array.length - 1) return array.push(item)
  return array.splice(index, 0, item)
}
