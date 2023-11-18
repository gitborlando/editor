export const { sqrt, PI, cos, sin, tan, abs } = Math

export function pow2(number: number) {
  return Math.pow(number, 2)
}
export function pow3(number: number) {
  return Math.pow(number, 3)
}

export function multiply(...args: number[]) {
  return args.reduce((i, all) => (all *= i), 1)
}
export const m = multiply
