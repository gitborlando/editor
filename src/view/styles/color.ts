import { hslRgb, rgbTuple } from 'src/utils/color'

const hue = 280

const root = document.body
root.style.setProperty('--hue', String(hue))
root.style.setProperty('--color', hslRgb(hue, 100, 50))
root.style.setProperty('--color-light', hslRgb(hue, 100, 70))
root.style.setProperty('--color-bg', hslRgb(hue, 100, 93))
root.style.setProperty('--color-bg-half', hslRgb(hue, 100, 98))
root.style.setProperty('--primary-6', rgbTuple(hslRgb(hue, 100, 50)).join(','))

export const themeColor = (lightness: number = 50) => {
  return hslRgb(hue, 100, lightness)
}
