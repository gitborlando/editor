import { CSSProperties } from 'react'
import { hslBlueColor } from '~/shared/utils/color'

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
  (position: CSSProperties['position']) =>
  (
    left?: number | (string & {}),
    top?: number | (string & {}),
    right?: number | (string & {}),
    bottom?: number | (string & {})
  ) => ({
    position,
    left,
    top,
    right,
    bottom,
  })
export const fixed = position('fixed')
export const relative = position('relative')
export const absolute = position('absolute')

export const transform = ({
  translateX,
  translateY,
  rotate,
}: {
  translateX?: '50%' | (string & {})
  translateY?: '50%' | (string & {})
  rotate?: number
}) => {
  const _translateX = translateX ? `translateX(${translateX})` : ''
  const _translateY = translateY ? `translateY(${translateY})` : ''
  const _rotate = rotate ? `rotate(${rotate}deg)` : ''
  return { transform: `${_translateX} ${_translateY} ${_rotate}` }
}

export const cursor = (type: 'pointer') => {
  return { cursor: type }
}

export const default$ = {
  border: (type?: 'left' | 'top' | 'right' | 'bottom') => {
    if (type === 'left') return { borderLeft: '1px solid #E3E3E3' }
    if (type === 'top') return { borderTop: '1px solid #E3E3E3' }
    if (type === 'right') return { borderRight: '1px solid #E3E3E3' }
    if (type === 'bottom') return { borderBottom: '1px solid #E3E3E3' }
    return { border: '1px solid #E3E3E3' }
  },
  borderBottom: {
    borderBottom: '1px solid #E3E3E3',
  },
  hover: {
    border: {
      '&:hover': {
        // boxShadow: 'inset 0 0 0px 0.7px #9166FF',
        boxShadow: 'inset 0 0 0px 0.7px ' + hslBlueColor(50),
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
      border: '1px solid ' + hslBlueColor(50),
    },
    boxShadow: {
      boxShadow: 'inset 0 0 0px 0.7px ' + hslBlueColor(50),
    },
    background: {
      // backgroundColor: 'rgba(114, 38, 255, 0.6)',
      backgroundColor: hslBlueColor(95),
    },
    font: {
      // color: 'rgba(123, 36, 255, 1)',
      color: hslBlueColor(50),
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
      // backgroundColor: 'rgba(234, 224, 255, 1)',
      backgroundColor: hslBlueColor(94),
    },
  },
  scrollBar: {
    '&::-webkit-scrollbar': {
      width: 4,
      height: 4,
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(204, 204, 204, 0.5)',
    },
  },
  input: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
  },
}
