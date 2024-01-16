import { ComponentPropsWithRef, forwardRef } from 'react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Button, IButtonProps } from '../button'
import { IIconProps, Icon } from '../icon'

export type IIconButton = ComponentPropsWithRef<'div'> & IButtonProps & IIconProps & {}

export const IconButton = forwardRef<HTMLDivElement, IIconButton>(
  ({ className, children, ...rest }, ref) => {
    const { classes, cx } = useStyles({})
    return (
      <Button type='icon' className={cx(classes.IconButton, className)} {...rest} ref={ref}>
        <Icon {...rest}>{children}</Icon>
      </Button>
    )
  }
)

type IIconButtonStyle = {} /* & Required<Pick<IIconButton>> */ /* & Pick<IIconButton> */

const useStyles = makeStyles<IIconButtonStyle>()((t) => ({
  IconButton: {},
}))

IconButton.displayName = 'IconButton'
