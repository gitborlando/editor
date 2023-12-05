import { CSSProperties } from 'react'

export * from './themes'

export interface IRect {
  width: number | 'fit-content' | `${number}%` | `${number}px` | `${number}vw` | (string & {})
  height: number | 'fit-content' | `${number}%` | `${number}px` | `${number}vh` | (string & {})
  left: number | `${number}%` | `${number}px` | (string & {})
  right: number | `${number}%` | `${number}px` | (string & {})
  top: number | `${number}%` | `${number}px` | (string & {})
  bottom: number | `${number}%` | `${number}px` | (string & {})
}

export const rect = (
  width: IRect['width'],
  height: IRect['height'],
  radius?: number | 'no-radius',
  bgColor?: CSSProperties['color'] | 'no-bgColor'
) => ({
  width,
  height,
  ...(radius && radius !== 'no-radius' && { borderRadius: radius }),
  ...(bgColor && bgColor !== 'no-bgColor' && { backgroundColor: bgColor }),
})

export const border = (width: number, color: CSSProperties['color']) => ({
  border: `${width}px solid ${color}`,
})

const position =
  (position: CSSProperties['position']) => (left?: IRect['left'], top?: IRect['top']) => ({
    position,
    left,
    top,
  })
export const fixed = position('fixed')
export const relative = position('relative')
export const absolute = position('absolute')

export const default$ = {
  borderBottom: { borderBottom: '1px solid #E3E3E3' },
  hover: {
    border: {
      '&:hover': {
        boxShadow: 'inset 0 0 0px 1px #57ADFB',
      },
    },
    background: {
      '&:hover': {
        backgroundColor: 'rgba(138, 138, 138, 0.13)',
        //color: 'rgba(36, 138, 255, 1)',
      },
    },
  },
  color: {
    active: { color: 'rgba(36, 138, 255, 1)' },
  },
  normalHeight: 32,
  select: {
    background: {
      backgroundColor: 'rgba(136, 130, 255, 0.21)',
    },
  },
}
