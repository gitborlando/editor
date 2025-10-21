export type IRGB = { r: number; g: number; b: number }
export type IRGBA = { r: number; g: number; b: number; a: number }
export function rgb(r: number | string, g: number | string, b: number | string) {
  return `rgb(${r},${g},${b})`
}
export function rgba(r: number, g: number, b: number, a: number = 1) {
  return `rgba(${r},${g},${b},${a})`
}
export function rgbToRgba(rgbString: string, alpha: number) {
  return rgbString.replace(/rgb/, 'rgba').replace(/\)/, `,${alpha})`)
}

export function isHexColor(hex: string) {
  return /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.test(hex)
}

export function hslRgb(h: number, s: number, l: number) {
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return rgb(255 * f(0), 255 * f(8), 255 * f(4))
}

export function hslColor(h: number, s: number, l: number) {
  return hslRgb(h, s, l)
}
