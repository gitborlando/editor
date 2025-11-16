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

export const snapHalfPixel = (n: number) => {
  return Math.round(n - 0.5) + 0.5
}

export function minMax(min: number, max: number, value: number) {
  return Math.min(Math.max(min, value), max)
}

export const expandOneStep = (
  number: number,
  step: number,
  direction: 'left' | 'right',
) => {
  const n = (number / step) | 0
  return direction === 'left' ? (n - 1) * step : (n + 1) * step
}
