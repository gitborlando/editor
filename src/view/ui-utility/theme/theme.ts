import { CSSProperties } from 'react'

export * from './themes'

export interface IRect {
  width: number | 'fit-content' | '100%' | '50%' | (string & {})
  height: number | 'fit-content' | '100%' | '50%' | (string & {})
  left: number | '100%' | (string & {})
  right: number | '100%' | (string & {})
  top: number | '100%' | (string & {})
  bottom: number | '100%' | (string & {})
}

export const rect = (
  width: IRect['width'] | '100%',
  height: IRect['height'] | '100%',
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
        boxShadow: 'inset 0 0 0px 0.7px #9166FF',
      },
    },
    background: {
      '&:hover': {
        backgroundColor: 'rgba(138, 138, 138, 0.13)',
      },
    },
    font: {
      '&:hover': {
        color: 'rgba(162, 112, 255, 1)',
      },
    },
  },
  active: {
    border: {
      boxShadow: 'inset 0 0 0px 0.7px #9166FF',
    },
    background: {
      backgroundColor: 'rgba(114, 38, 255, 0.6)',
    },
    font: {
      color: 'rgba(123, 36, 255, 1)',
    },
  },
  disabled: {
    font: {
      color: 'rgba(201, 201, 201, 1)',
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
