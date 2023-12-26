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
