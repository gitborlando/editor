import { observer, useLocalObservable } from 'mobx-react'
import RCInput from 'rc-input'
import { ComponentPropsWithRef, forwardRef } from 'react'
import { Drag } from '~/global/event/drag'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '../../../../ui-utility/widget/icon'

export interface IInput extends ComponentPropsWithRef<'div'> {
  label: string
  value: number
  onNewValueApply: (value: number) => void
  step?: number
  slideRate?: number
}

export const Input = observer(
  forwardRef<HTMLDivElement, IInput>(
    ({ className, label, value, onNewValueApply: emitNewValue, step = 1, slideRate = 1 }, ref) => {
      const { classes, cx } = useStyles({})
      const state = useLocalObservable(() => ({
        // value: value,
        active: false,
        hover: false,
      }))
      return (
        <Flex
          layout='h'
          className={cx(classes.Input, className /* state.active && classes.active */)}
          ref={ref}
          onHover={(h) => (state.hover = h)}>
          <Flex
            layout='h'
            className={cx(classes.label, 'label')}
            onMouseDown={() => {
              let startValue = value
              Drag.setCursor('e-resize')
                .onStart(() => (state.active = true))
                .onMove(({ shift }) => emitNewValue(startValue + shift.x * slideRate))
                .onDestroy(({ dragService }) => {
                  dragService.setCursor('auto')
                  state.active = false
                })
            }}>
            {label}
          </Flex>
          <Flex layout='h'>
            <RCInput
              type='number'
              value={value}
              className={classes.input}
              onBlur={(e) => emitNewValue(Number(e.target.value))}
            />
          </Flex>
          <Flex layout='v' vshow={state.hover} className={cx(classes.operate, 'operator')}>
            <Flex layout='c' onClick={() => emitNewValue(value + step)}>
              <Icon size={7} scale={0.7}>
                {Asset.editor.widget.numberInput.operateUp}
              </Icon>
            </Flex>
            <Flex layout='c' onClick={() => emitNewValue(value - step)}>
              <Icon size={7} scale={0.7} rotate={180}>
                {Asset.editor.widget.numberInput.operateUp}
              </Icon>
            </Flex>
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
    ...t.default$.hover.border,
    boxSizing: 'border-box',
    userSelect: 'none',
    paddingLeft: 10,
  },
  active: {
    ...t.default$.active.boxShadow,
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
  operate: {
    ...t.rect(16, '100%'),
    flexShrink: 0,
    '& div': {
      ...t.rect('100%', '50%'),
      ...t.labelFont,
      cursor: 'pointer',
    },
  },
}))

Input.displayName = 'Input'
