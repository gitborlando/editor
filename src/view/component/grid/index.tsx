import cx from 'classix'
import { ComponentPropsWithRef, FC, memo } from 'react'
import './index.less'

export const Grid: FC<
  {
    horizontal?: string
    vertical?: string
    center?: boolean
    gap?: number
  } & ComponentPropsWithRef<'div'>
> = memo(({ children, style, className, horizontal, vertical, gap, center, ...rest }) => {
  return (
    <div
      className={cx('grid', className)}
      style={{
        ...style,
        gridTemplateColumns: horizontal,
        gridTemplateRows: vertical,
        gap: gap,
        ...(center && { justifyContent: 'center', alignItems: 'center' }),
      }}
      {...rest}>
      {children}
    </div>
  )
})

export const G = Grid
