import { ComponentPropsWithRef, forwardRef } from 'react'
import { hslBlueColor } from '~/shared/utils/color'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'

export type IButtonProps = ComponentPropsWithRef<'div'> & {
  type?: 'text' | 'normal' | 'icon'
  active?: boolean
  disabled?: boolean
}

export const Button = forwardRef<HTMLDivElement, IButtonProps>(
  ({ type = 'normal', active = false, disabled = false, className, children, ...rest }, ref) => {
    const { classes, cx } = useStyles({ active, disabled })
    return (
      <Flex
        layout='c'
        className={cx(
          classes.Button,
          className,
          type === 'normal' && classes.normal,
          type === 'text' && classes.text,
          type === 'icon' && classes.icon
        )}
        {...(!disabled && rest)}
        ref={ref}>
        {children}
      </Flex>
    )
  }
)

type IButtonStyle = {} /* & Required<Pick<IButton>> */ & Pick<IButtonProps, 'active' | 'disabled'>

const useStyles = makeStyles<IButtonStyle>()((t, { active, disabled }) => ({
  Button: {
    ...t.labelFont,
    ...(disabled && { ...t.default$.disabled.font }),
    ...(!disabled && { cursor: 'pointer' }),
  },
  normal: {
    ...t.rect('fit-content', 'fit-content', 4),
    padding: 6,
    marginInline: 2,
    ...(!disabled && active && { color: hslBlueColor(65), ...t.default$.active.background }),
    ...(!active && !disabled && { ...t.default$.hover.background }),
  },
  text: {
    ...(!disabled && active && { ...t.default$.active.font }),
    ...(!active && !disabled && { ...t.default$.hover.font }),
  },
  icon: {
    ...t.rect('fit-content', 'fit-content', 4),
    padding: 4,
    marginInline: 2,
    ...(!disabled && active && { color: hslBlueColor(65), ...t.default$.active.background }),
    ...(!active && !disabled && { ...t.default$.hover.background }),
  },
}))

Button.displayName = 'Button'
