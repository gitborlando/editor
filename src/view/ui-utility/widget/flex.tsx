import { ComponentPropsWithRef, forwardRef } from 'react'

export interface IFlexProps extends ComponentPropsWithRef<'div'> {
  vshow?: boolean
  onHover?: (isHover: boolean) => void
}

export const Flex = forwardRef<HTMLDivElement, IFlexProps>(
  ({ vshow = true, className, onHover, onMouseEnter, onMouseLeave, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={`${':uno: shrink-1'} ${className || ''} ${
          vshow ? ':uno: flex' : ':uno: hidden'
        }`}
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
