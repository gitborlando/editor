import hexRgb from 'hex-rgb'
import { atan, degreefy } from 'src/editor/math/base'
import { IFillColor, IFillLinearGradient } from 'src/editor/schema/type'
import { memorize } from 'src/shared/utils/normal'
import { hslColor, IRGBA, rgb } from 'src/utils/color'

export const COLOR = {
  white: rgb(255, 255, 255),
  black: rgb(0, 0, 0),
  blue: rgb(0, 200, 255),
  pinkRed: rgb(255, 117, 193),
}

export function rgbaString({ r, g, b, a }: IRGBA) {
  return `rgba(${r},${g},${b},${a})`
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
