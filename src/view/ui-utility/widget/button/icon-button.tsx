import { ComponentPropsWithRef, forwardRef } from 'react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Button, IButtonProps } from '../button'
import { IIconProps, Icon } from '../icon'

export type IIconButton = ComponentPropsWithRef<'div'> & IButtonProps & IIconProps & {}

export const IconButton = forwardRef<HTMLDivElement, IIconButton>(
  ({ className, children, ...rest }, ref) => {
    const { classes, cx } = useStyles({})
    const { size, rotate, fill, scale } = rest
    const iconProps = { size, rotate, fill, scale }
    return (
      <Button type='icon' className={cx(classes.IconButton, className)} {...rest} ref={ref}>
        <Icon {...iconProps}>{children}</Icon>
      </Button>
    )
  }
)

type IIconButtonStyle = {} /* & Required<Pick<IIconButton>> */ /* & Pick<IIconButton> */

const useStyles = makeStyles<IIconButtonStyle>()((t) => ({
  IconButton: {},
}))

IconButton.displayName = 'IconButton'
