import { useLocalObservable } from 'mobx-react'
import { ComponentPropsWithRef, forwardRef } from 'react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'

interface IButton extends ComponentPropsWithRef<'div'> {}

export const Button = forwardRef<HTMLDivElement, IButton>(
  ({ className, children, ...rest }, ref) => {
    const { classes, cx } = useStyles({})
    const {} = useLocalObservable(() => ({}))
    return (
      <Flex
        sidePadding={8}
        layout='c'
        className={cx(classes.Button, className)}
        {...rest}
        ref={ref}>
        {children}
      </Flex>
    )
  }
)

type IButtonStyle = {} /* & Required<Pick<IButton>> */ /* & Pick<IButton> */

const useStyles = makeStyles<IButtonStyle>()((t) => ({
  Button: {
    ...t.rect('fit-content', t.default$.normalHeight),
    ...t.labelFont,
    ...t.default$.hover.background,
    cursor: 'pointer',
  },
}))

Button.displayName = 'Button'
