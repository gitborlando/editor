import { CSSProperties } from 'react'

export const bgColor = (backgroundColor: CSSProperties['color']) => ({
  backgroundColor,
})

export const pointer = () => ({
  cursor: 'pointer',
})

export const noSelect = () => ({
  userSelect: 'none' as CSSProperties['userSelect'],
})
