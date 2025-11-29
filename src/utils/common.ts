export function twoDecimal(number: number) {
  return Number(number.toFixed(Number.isInteger(number) ? 0 : 2))
}
export const expandOneStep = (
  number: number,
  step: number,
  direction: 'left' | 'right',
) => {
  const n = (number / step) | 0
  return direction === 'left' ? (n - 1) * step : (n + 1) * step
}

export const snapHalfPixel = (n: number) => {
  return Math.round(n - 0.5) + 0.5
}
