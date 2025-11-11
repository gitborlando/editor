export const { PI, cos, sin, tan, acos, asin, atan, atan2 } = Math
export const { sqrt, abs, min, max, round, floor, ceil, random } = Math

export const rcos = (degree: number) => cos(radianfy(degree))
export const rsin = (degree: number) => sin(radianfy(degree))
export const rtan = (degree: number) => tan(radianfy(degree))
export const racos = (degree: number) => acos(radianfy(degree))
export const rasin = (degree: number) => asin(radianfy(degree))
export const ratan = (degree: number) => atan(radianfy(degree))
export const ratan2 = (y: number, x: number) => degreefy(atan2(y, x))

export function pow2(number: number) {
  return Math.pow(number, 2)
}
export function pow3(number: number) {
  return Math.pow(number, 3)
}

export function multiply(...numbers: number[]) {
  return numbers.reduce((i, all) => (all *= i), 1)
}
export function divide(a: number, b: number) {
  return b === 0 ? 1 : a / b
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

export function rotatePoint(
  ax: number,
  ay: number,
  ox: number,
  oy: number,
  degree: number,
) {
  const radian = radianfy(degree)
  return {
    x: (ax - ox) * cos(radian) - (ay - oy) * sin(radian) + ox,
    y: (ax - ox) * sin(radian) + (ay - oy) * cos(radian) + oy,
  }
}

export function normalAngle(angle: number) {
  return (angle + 360) % 360
}

export const nearestInt = (number: number, rate: number = 1) => {
  const n = (number / rate) | 0
  const left = rate * n
  const right = rate * (n + 1)
  return number - left <= right - number ? left : right
}

export const nearestPixel = (n: number) => {
  const left = Math.floor(n)
  const right = Math.ceil(n)
  return (n - left < right - n ? left : right) + 0.5
}
