export function firstOne(input: any[] | Set<any>) {
  return [...input][0]
}
export function lastOne(input: any[] | Set<any>) {
  const arr = [...input]
  return arr[arr.length - 1]
}

export function insertAt<T>(array: T[], index: number, item: T) {
  if (index < 0 || index > array.length - 1) return
  array.splice(index, 0, item)
}
