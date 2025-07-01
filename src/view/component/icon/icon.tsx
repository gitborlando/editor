import cx from 'classix'
import { ComponentPropsWithRef, forwardRef } from 'react'
import './icon.less'

export type IconProps = ComponentPropsWithRef<'div'> & {
  url: string
}

export const Icon = forwardRef<HTMLDivElement, IconProps>(
  ({ url, className, style, ...rest }, ref) => {
    return (
      <div
        className={cx('g-icon', className)}
        style={{
          ...style,
          mask: `url(${url}) no-repeat center / contain`,
          WebkitMask: `url(${url}) no-repeat center / contain`,
          backgroundColor: 'currentcolor',
        }}
        {...rest}
        ref={ref}></div>
    )
  }
)

Icon.displayName = 'Icon'
