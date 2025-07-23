import hexRgb from 'hex-rgb'
import { atan, degreefy } from 'src/editor/math/base'
import { IFillColor, IFillLinearGradient } from 'src/editor/schema/type'
import { memorize } from 'src/shared/utils/normal'

export function isHexColor(hex: string) {
  return /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.test(hex)
}

export const COLOR = {
  white: rgb(255, 255, 255),
  blue: rgb(0, 200, 255),
  pinkRed: rgb(255, 117, 193),
}

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

export function hslColor(h: number, s: number, l: number) {
  return rgbaString(hslToRgba(h, s, l))
}

export const hslBlueColor = memorize((l: number) => {
  return hslColor(217, 100, l)
})

export function makeLinearGradientCss({ start, end, stops }: IFillLinearGradient) {
  const degree = degreefy(atan((end.x - start.x) / (end.y - start.y))) + 90
  return `linear-gradient(${degree}deg, ${stops[0].color} 0%, ${stops
    .map(({ color, offset }) => `${color} ${offset * 100}%`)
    .join(', ')}, ${stops[stops.length - 1].color} 100%)`
}

export function getColorFromFill(fill: IFillColor) {
  const { color, alpha } = fill
  return color.replace('rgb', 'rgba').replace(')', `,${alpha})`)
}

export function normalizeColor(input?: string) {
  if (input?.startsWith('rgb')) return { color: input, alpha: 1 }
  if (input?.startsWith('#')) {
    const [r, g, b] = hexRgb(input, { format: 'array' })
    return { color: rgb(r, g, b), alpha: 1 }
  }
  if (COLOR[input as keyof typeof COLOR]) {
    return { color: COLOR[input as keyof typeof COLOR], alpha: 1 }
  }
  return { color: rgb(166, 166, 166), alpha: 1 }
}
