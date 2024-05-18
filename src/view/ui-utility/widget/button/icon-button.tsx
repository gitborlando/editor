import { ComponentPropsWithRef, forwardRef } from 'react'
import { Button, IButtonProps } from '../button'
import { IIconProps, Icon } from '../icon'

export type IIconButton = ComponentPropsWithRef<'div'> & IButtonProps & IIconProps & {}

export const IconButton = forwardRef<HTMLDivElement, IIconButton>(
  ({ className, children, ...rest }, ref) => {
    const { size, rotate, fill, scale } = rest
    const iconProps = { size, rotate, fill, scale }
    return (
      <Button type='icon' className={className} {...rest} ref={ref}>
        <Icon {...iconProps}>{children}</Icon>
      </Button>
    )
  }
)
