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
  random: () => hslRgb(Math.random() * 360, 100, 50),
  white: hslRgb(0, 0, 100),
  black: hslRgb(0, 0, 0),
  blue: hslRgb(HUE_MAP.blue, 100, 50),
  pinkRed: hslRgb(HUE_MAP.pink, 100, 50),
}

export const themeHue$ = Signal.create(HUE_MAP.blue)

themeHue$.hook({ immediately: true }, (value) => {
  const root = document.documentElement
  root?.style.setProperty('--hue', String(value))
  root?.style.setProperty('--color', hslRgb(value, 100, 50))
  root?.style.setProperty('--color-bg', hslRgb(value, 100, 95))
  root?.style.setProperty('--color-bg-half', hslRgb(value, 100, 98))
})

export const themeColor = (lightness: number = 50) => {
  return hslRgb(themeHue$.value, 100, lightness)
}
