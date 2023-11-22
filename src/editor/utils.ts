export type IXY = { x: number; y: number }
export type IBound = IXY & { width: number; height: number }
export type ICursor = 'auto' | 'n-resize' | 'e-resize' | 'grab' | (string & {})

export const { sqrt, cos, sin, tan, abs } = Math
export function pow2(number: number) {
  return Math.pow(number, 2)
}
export function pow3(number: number) {
  return Math.pow(number, 3)
}

export function multiply(...numbers: number[]) {
  return numbers.reduce((i, all) => (all *= i), 1)
}
export function divide(...numbers: number[]) {
  return numbers.reduce((i, all) => (all /= i), 1)
}

export function degreefy(radians: number) {
  return radians * (180 / Math.PI)
}
export function radianfy(degrees: number) {
  return degrees * (Math.PI / 180)
}

export function randomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`
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

export function lazyInject(target: any, serviceName: string, service: any) {
  target[serviceName] = service
}

export function loopForEach<T>(
  array: T[],
  callback: (current: T, left: T, next: T, index: number) => void
) {
  array.forEach((current, index) => {
    const left = index === 0 ? array.length - 1 : index - 1
    const right = index === array.length - 1 ? 0 : index + 1
    callback(current, array[left], array[right], index)
  })
}

export function hierarchyUp<T>(target: T[], filter: string | ((value: T) => void)) {
  const index =
    typeof filter === 'function' ? target.findIndex(filter) : target.findIndex((i) => i === filter)
  if (index <= 0) return
  ;[target[index - 1], target[index]] = [target[index], target[index - 1]]
}
export function hierarchyDown<T>(target: T[], filter: string | ((value: T) => void)) {
  const index =
    typeof filter === 'function' ? target.findIndex(filter) : target.findIndex((i) => i === filter)
  if (index >= target.length - 1) return
  ;[target[index], target[index + 1]] = [target[index + 1], target[index]]
}

export function rgbaToHex(r: number, g: number, b: number, a: number) {
  const hexR = ('0' + r.toString(16)).slice(-2)
  const hexG = ('0' + g.toString(16)).slice(-2)
  const hexB = ('0' + b.toString(16)).slice(-2)
  const hexA = ('0' + Math.round(a * 255).toString(16)).slice(-2)
  const hexColor = `#${hexR}${hexG}${hexB}${hexA}`
  return hexColor.toUpperCase()
}
