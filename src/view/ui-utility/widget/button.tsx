import { useLocalObservable } from 'mobx-react'
import { ComponentPropsWithRef, forwardRef } from 'react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'

type IButton = ComponentPropsWithRef<'div'> & {
  type?: 'text' | 'normal'
  active?: boolean
  disabled?: boolean
}

export const Button = forwardRef<HTMLDivElement, IButton>(
  ({ type = 'normal', active = false, disabled = false, className, children, ...rest }, ref) => {
    const { classes, cx } = useStyles({ active, disabled })
    const {} = useLocalObservable(() => ({}))
    return (
      <Flex
        sidePadding={8}
        layout='c'
        className={cx(
          classes.Button,
          className,
          type === 'normal' && classes.normal,
          type === 'text' && classes.text
        )}
        {...(!disabled && rest)}
        ref={ref}>
        {children}
      </Flex>
    )
  }
)

type IButtonStyle = {} /* & Required<Pick<IButton>> */ & Pick<IButton, 'active' | 'disabled'>

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
    ...(!disabled && active && { color: 'white', ...t.default$.active.background }),
    ...(!active && !disabled && { ...t.default$.hover.background }),
  },
  text: {
    ...(!disabled && active && { ...t.default$.active.font }),
    ...(!active && !disabled && { ...t.default$.hover.font }),
  },
}))

Button.displayName = 'Button'
