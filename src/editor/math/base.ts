export const { PI, sqrt, cos, sin, tan, abs, min, max, acos, atan } = Math

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

export function minToMax(...numbers: number[]) {
  numbers.sort((a, b) => a - b)
  return numbers
}
export function maxToMin(...numbers: number[]) {
  numbers.sort((a, b) => b - a)
  return numbers
}

export function numberHalfFix(number: number) {
  const integerPart = ~~number
  const floatPart = number - integerPart
  const halfFixed = floatPart >= 0.75 ? 1 : floatPart >= 0.25 ? 0.5 : 0
  return integerPart + halfFixed
}
