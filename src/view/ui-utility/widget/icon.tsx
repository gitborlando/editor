import { ComponentPropsWithRef, forwardRef } from 'react'
import { makeStyles } from '../theme'

interface IIconProps extends ComponentPropsWithRef<'div'> {}

export const Icon = forwardRef<HTMLDivElement, IIconProps>(({ className, ...rest }, ref) => {
  const { classes, cx } = useStyles({})
  return <div className={cx(classes.Icon, className)} {...rest} ref={ref}></div>
})

type IIconStyleProps = {} /* & Required<Pick<IIconProps>> */ /* & Pick<IIconProps> */

const useStyles = makeStyles<IIconStyleProps>()((t) => ({
  Icon: {},
}))

Icon.displayName = 'Icon'
