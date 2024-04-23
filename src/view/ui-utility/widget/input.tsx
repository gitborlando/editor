import RCInput, { InputProps, InputRef } from 'rc-input'
import { FC, memo, useEffect, useRef } from 'react'
import { makeStyles } from '~/view/ui-utility/theme'

type IInputComp = InputProps & {}

export const InputComp: FC<IInputComp> = memo((props) => {
  const { type } = props
  const ref = useRef<InputRef>(null!)
  const { classes, theme, css, cx } = useStyles({})
  useEffect(() => {
    if (!ref.current || type !== 'text') return
    const value = ref.current.input?.value || ''
    ref.current.setSelectionRange(0, value.length - 1)
  }, [])
  return <RCInput {...props} className={cx(props.className, classes.Input)} ref={ref} />
})

type IInputCompStyle = {} /* & Required<Pick<IInputComp>> */ /* & Pick<IInputComp> */

const useStyles = makeStyles<IInputCompStyle>()((t) => ({
  Input: {
    ...t.default$.font.normal,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
  },
}))

InputComp.displayName = 'InputComp'
