import { ComponentPropsWithRef, FC, forwardRef } from 'react'
import './flex.less'
import cx from 'classix'

export interface FlexProps extends ComponentPropsWithRef<'div'> {
  vshow?: boolean
  onHover?: (isHover: boolean) => void
}

export const Flex = forwardRef<HTMLDivElement, FlexProps>(
  ({ vshow = true, className, onHover, onMouseEnter, onMouseLeave, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cx(vshow ? 'flex' : '__hidden', className)}
        onMouseEnter={(e) => {
          onHover?.(true)
          onMouseEnter?.(e)
        }}
        onMouseLeave={(e) => {
          onHover?.(false)
          onMouseLeave?.(e)
        }}
        {...rest}></div>
    )
  }
)

Flex.displayName = 'Flex'
