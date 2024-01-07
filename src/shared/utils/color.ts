export const COLOR = {
  white: rgba(255, 255, 255),
  blue: rgba(0, 200, 255),
  pinkRed: rgba(255, 117, 193),
}

export type IRGBA = { r: number; g: number; b: number; a: number }

export function rgba(r: number, g: number, b: number, a: number = 1) {
  return { r, g, b, a }
}

export function rgbaString({ r, g, b, a }: IRGBA) {
  return `rgba(${r},${g},${b},${a})`
}

export function hslToRgba(h: number, s: number, l: number) {
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return { r: 255 * f(0), g: 255 * f(8), b: 255 * f(4), a: 1 }
}

export function hslBlueColor(l: number) {
  return rgbaString(hslToRgba(217, 100, l))
}
