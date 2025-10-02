import cx from 'classix'
import { ComponentPropsWithRef, FC, memo } from 'react'
import './index.less'

export const Grid: FC<
  {
    horizontal?: string
    vertical?: string
    gap?: number
  } & ComponentPropsWithRef<'div'>
> = memo(({ children, style, className, horizontal, vertical, gap, ...rest }) => {
  return (
    <div
      className={cx('grid', className)}
      style={{
        ...style,
        gridTemplateColumns: horizontal,
        gridTemplateRows: vertical,
      }}
      {...rest}>
      {children}
    </div>
  )
})

export const G = Grid
