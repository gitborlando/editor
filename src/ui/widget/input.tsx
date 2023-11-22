import { observer, useLocalObservable } from 'mobx-react'
import { ChangeEvent, ComponentPropsWithRef, forwardRef } from 'react'
import { makeStyles } from '~/ui/theme'
import { Flex } from '~/ui/widget/flex'
import { useService } from '../context'

interface IInput extends ComponentPropsWithRef<'div'> {
  label: string
  value: number
  onNewValueApply: (value: number) => void
  min?: number
  max?: number
}

export const Input = observer(
  forwardRef<HTMLDivElement, IInput>(
    ({ className, label, value: outValue, onNewValueApply: emitNewValue, min, max }, ref) => {
      const { classes, cx } = useStyles({})
      const { dragService } = useService()
      const state = useLocalObservable(() => ({ value: outValue }))
      state.value = outValue
      return (
        <Flex layout='h' className={cx(classes.Input, className)} ref={ref}>
          <Flex
            layout='h'
            className={classes.label}
            onMouseDown={() => {
              let startValue = state.value
              dragService.setCursor('e-resize').onSlide(({ shift }) => {
                state.value = startValue + shift.x
                if (min !== undefined && state.value < min) state.value = min
                if (max !== undefined && state.value > max) state.value = max
                emitNewValue(state.value)
              })
            }}>
            {label}
          </Flex>
          <Flex layout='h'>
            <input
              type='number'
              value={state.value}
              onChange={(e) => {
                state.value = parseFloat((e as ChangeEvent<HTMLInputElement>).target.value)
                if (min !== undefined && state.value < min) state.value = min
                if (max !== undefined && state.value > max) state.value = max
              }}
              className={classes.input}
              onBlur={() => emitNewValue(state.value)}
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
