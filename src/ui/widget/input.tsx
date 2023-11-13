import { observer } from 'mobx-react'
import { ComponentPropsWithRef, forwardRef, useRef } from 'react'
import { makeStyles } from '~/ui/theme'
import { Flex } from '~/ui/widget/flex'
import { useEditor } from '../context'

interface IInput extends ComponentPropsWithRef<'div'> {
  label: string
  value: number
  onNewValueApply: (value: number) => void
  min?: number
  max?: number
}

export const Input = observer(
  forwardRef<HTMLDivElement, IInput>(
    ({ className, label, value, onNewValueApply: emitNewValue, min, max, ...rest }, ref) => {
      const { classes, cx } = useStyles({})
      const { drag } = useEditor()
      const inputRef = useRef<HTMLInputElement>(null)
      const changeValue = (newValue: number) => {
        if (min !== undefined && newValue < min) newValue = min
        if (max !== undefined && newValue > max) newValue = max
        emitNewValue(newValue)
        if (inputRef.current) inputRef.current.value = newValue + ''
      }

      return (
        <Flex layout='h' className={cx(classes.Input, className)} ref={ref}>
          <Flex
            layout='h'
            className={classes.label}
            onMouseDown={() => {
              drag
                .onSlide(({ shift }) => {
                  changeValue(value + shift.x)
                })
                .setCursor('e-resize')
            }}>
            {label}
          </Flex>
          <Flex layout='h'>
            <input
              type='number'
              ref={inputRef}
              defaultValue={value}
              className={classes.input}
              onBlur={(e) => {
                changeValue(parseInt(e.target.value || '0'))
              }}
            />
          </Flex>
        </Flex>
      )
    }
  )
)

type IInputStyle = {} /* & Required<Pick<IInput>> */ /* & Pick<IInput> */

const useStyles = makeStyles<IInputStyle>()((t) => ({
  Input: {
    ...t.rect('100%', t.default$.normalHeight),
    ...t.paddingHorizontal(10),
    ...t.default$.hover.background,
    boxSizing: 'border-box',
    userSelect: 'none',
  },
  label: {
    width: 44,
    flexShrink: 0,
    fontSize: 11,
    color: 'gray',
    paddingRight: 10,
    cursor: 'e-resize',
  },
  input: {
    ...t.rect('100%', 16, 'no-radius', 'transparent'),
    outline: 'none',
    border: 'none',
    fontSize: 12,
    transform: 'translateY(0.5px)',
    '&::-webkit-outer-spin-button': {
      WebkitAppearance: 'none',
      appearance: 'none',
    },
    '&::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      appearance: 'none',
    },
  },
}))

Input.displayName = 'Input'
