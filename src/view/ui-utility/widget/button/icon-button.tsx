import { Icon, IconProps } from '@gitborlando/widget'
import { ComponentPropsWithRef, forwardRef } from 'react'
import { Button, IButtonProps } from '../button'

export type IIconButton = ComponentPropsWithRef<'div'> & IButtonProps & IconProps & {}

export const IconButton = forwardRef<HTMLDivElement, IIconButton>(
  ({ className, children, ...rest }, ref) => {
    return (
      <Button type='icon' className={className} {...rest} ref={ref}>
        <Icon url={children as string} />
      </Button>
    )
  }
)
