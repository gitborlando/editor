import { hslRgb } from 'src/utils/color'

export const HUE_MAP = {
  red: 0,
  orange: 30,
  yellow: 60,
  green: 120,
  blue: 216,
  purple: 270,
  pink: 300,
}

export const COLOR = {
  white: hslRgb(0, 0, 100),
  blue: hslRgb(HUE_MAP.blue, 100, 50),
  pinkRed: hslRgb(HUE_MAP.pink, 100, 50),
}

export const mainHue$ = Signal.create(HUE_MAP.blue)

mainHue$.hook({ immediately: true }, (value) => {
  const style = document.documentElement.style
  style.setProperty('--color', hslRgb(value, 100, 50))
  style.setProperty('--color-bg', hslRgb(value, 100, 95))
})

export const mainColor = (lightness: number = 50) => {
  return hslRgb(mainHue$.value, 100, lightness)
}
