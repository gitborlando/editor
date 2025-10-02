import { ComponentPropsWithRef, FC, memo } from 'react'

export const Grid: FC<
  {
    horizontal?: string
    vertical?: string
    gap?: number
  } & ComponentPropsWithRef<'div'>
> = memo(({ children, style, horizontal, vertical, gap, ...rest }) => {
  return (
    <div
      style={{
        ...style,
        display: 'grid',
        gridTemplateColumns: horizontal,
        gridTemplateRows: vertical,
        gap,
      }}
      {...rest}>
      {children}
    </div>
  )
})

export const G = Grid
