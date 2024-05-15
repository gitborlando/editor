import RCInput, { InputProps } from 'rc-input'
import { ComponentPropsWithRef, forwardRef, memo, useRef } from 'react'
import { Drag } from '~/global/event/drag'
import { useAutoSignal } from '~/shared/signal/signal-react'
import { useDownUpTracker } from '~/shared/utils/event'
import { iife, noopFunc } from '~/shared/utils/normal'
import { useMemoComp } from '~/shared/utils/react'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from './icon'

export type ICompositeInput = ComponentPropsWithRef<'div'> &
  InputProps & {
    type?: string
    label?: string
    value: string
    onNewValueApply: (value: string) => void
    needStepHandler?: boolean
    needLabelDrag?: boolean
    step?: number
    slideRate?: number
    disabled?: boolean
    beforeOperate?: () => void
    afterOperate?: () => void
    styles?: {
      needHover?: boolean
    }
  }

export const CompositeInput = memo(
  forwardRef<HTMLDivElement, ICompositeInput>(
    (
      {
        type = 'number',
        className,
        label,
        value,
        onNewValueApply: emitNewValue,
        step = 1,
        needStepHandler = true,
        needLabelDrag = true,
        slideRate = 1,
        disabled,
        beforeOperate = noopFunc,
        afterOperate = noopFunc,
        onFocus,
        onBlur,
        styles = {},
      },
      ref
    ) => {
      const { classes, cx, css, theme } = useStyles({})
      const active = useAutoSignal(false)
      const hover = useAutoSignal(false)
      //  if (label === '横坐标') console.log('value: 横坐标', value)
      const numberValue = () => Number(Number.isNaN(Number(value)) ? '0' : value)

      const DragLabelComp = useMemoComp([value, disabled], ({}) => {
        if (!label) return
        return (
          <Flex
            layout='h'
            className={cx(classes.label, 'label')}
            style={{ ...(type === 'number' && { cursor: 'e-resize' }) }}
            onMouseDown={() => {
              if (disabled || needLabelDrag !== true) return
              let startValue = numberValue()
              beforeOperate?.()
              Drag.onStart(() => active.dispatch(true))
                .onMove(({ shift }) => emitNewValue((startValue + shift.x * slideRate).toString()))
                .onDestroy(({ dragService }) => {
                  active.dispatch(false)
                  afterOperate?.()
                })
            }}>
            {label}
          </Flex>
        )
      })

      const InputComp = useMemoComp([value, disabled], ({}) => {
        const thisValue = useAutoSignal(value)
        // useMemo(() => {
        //   if (label === '横坐标') console.log('value: ', value)
        //   thisValue.value = value
        // }, [value])
        const thisType = value === 'multi' ? 'text' : type
        // if (label === '横坐标') {
        //   // console.log('value: ', value)
        //   console.log('thisValue: ', thisValue.value)
        //   // console.log('thisType: ', thisType)
        // }
        return (
          <Flex layout='h'>
            <RCInput
              type={thisType}
              disabled={disabled}
              value={thisValue.value}
              className={classes.input}
              onFocus={(e) => {
                active.dispatch(true)
                onFocus?.(e)
                beforeOperate?.()
              }}
              onChange={(e) => {
                thisValue.dispatch(e.target.value)
              }}
              onBlur={(e) => {
                active.dispatch(false)
                onBlur?.(e)
                emitNewValue(e.target.value)
                afterOperate?.()
              }}
            />
          </Flex>
        )
      })

      const OperateComp = useMemoComp([value, step], ({}) => {
        const ref = useRef<HTMLDivElement>(null)
        useDownUpTracker(() => ref.current, beforeOperate, afterOperate)
        return (
          <Flex
            layout='v'
            ref={ref}
            vshow={hover.value}
            className={cx(classes.operate, 'operator')}>
            <Flex layout='c' onMouseDown={() => emitNewValue((numberValue() + step).toString())}>
              <Icon size={7} scale={0.7}>
                {Asset.editor.widget.numberInput.operateUp}
              </Icon>
            </Flex>
            <Flex layout='c' onMouseDown={() => emitNewValue((numberValue() - step).toString())}>
              <Icon size={7} scale={0.7} rotate={180}>
                {Asset.editor.widget.numberInput.operateUp}
              </Icon>
            </Flex>
          </Flex>
        )
      })

      const mainStyle = iife(() => {
        const needHoverCss = css({ ...theme.default$.hover.background })
        return cx(styles.needHover && needHoverCss)
      })

      return (
        <Flex
          layout='h'
          className={cx(classes.CompositeInput, mainStyle, className)}
          ref={ref}
          onHover={hover.dispatch}>
          <DragLabelComp />
          <InputComp />
          {/* {needStepHandler === true && !disabled && <OperateComp />} */}
        </Flex>
      )
    }
  )
)

type ICompositeInputStyle = {} /* & Required<Pick<ICompositeInput>> */ /* & Pick<ICompositeInput> */

const useStyles = makeStyles<ICompositeInputStyle>()((t) => ({
  CompositeInput: {
    ...t.rect(92, 28, 2),
    // ...t.rect('100%', t.default$.normalHeight),
    // ...t.default$.background,
    paddingLeft: 6,
    boxSizing: 'border-box',
    userSelect: 'none',
  },
  active: {
    ...t.default$.active.boxShadow,
  },
  label: {
    width: 36,
    flexShrink: 0,
    fontSize: 11,
    color: 'gray',
    marginRight: 6,
  },
  input: {
    ...t.rect('100%', 16, 'no-radius', 'transparent'),
    outline: 'none',
    border: 'none',
    fontSize: 12,
    transform: 'translateY(0.5px)',
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

CompositeInput.displayName = 'CompositeInput'
