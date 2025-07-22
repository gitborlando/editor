import { Flex, Icon } from '@gitborlando/widget'
import RCInput, { InputProps } from 'rc-input'
import { ComponentPropsWithRef, forwardRef, memo, useRef } from 'react'
import { Drag } from 'src/global/event/drag'
import { useAutoSignal } from 'src/shared/signal/signal-react'
import { useDownUpTracker } from 'src/shared/utils/event'
import { cx, noopFunc } from 'src/shared/utils/normal'
import { useMemoComp } from 'src/shared/utils/react'

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
      },
      ref
    ) => {
      const active = useAutoSignal(false)
      const hover = useAutoSignal(false)
      //  if (label === '横坐标') console.log('value: 横坐标', value)
      const numberValue = () => Number(Number.isNaN(Number(value)) ? '0' : value)

      const DragLabelComp = useMemoComp([value, disabled], ({}) => {
        if (!label) return
        return (
          <Flex
            layout='h'
            className={cx('label', 'w-36 shrink-0 text-11 text-gray mr-6')}
            style={{ ...(type === 'number' && { cursor: 'e-resize' }), flexShrink: 0 }}
            onMouseDown={() => {
              if (disabled || needLabelDrag !== true) return
              let startValue = numberValue()
              beforeOperate?.()
              Drag.needInfinity()
                .onStart(() => active.dispatch(true))
                .onMove(({ shift }) => emitNewValue((startValue + shift.x * slideRate).toString()))
                .onDestroy(() => {
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
          <Flex layout='h' className='translate-y-0.5'>
            <RCInput
              type={thisType}
              disabled={disabled}
              value={thisValue.value}
              className='wh-100%-14 px-4 outline-none border-none text-12 text-align-center bg-transparent'
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
          <Flex layout='v' className='wh-16-100% shrink-0' ref={ref} vshow={hover.value}>
            <Flex
              layout='c'
              className=''
              onMouseDown={() => emitNewValue((numberValue() + step).toString())}>
              <Icon
                className='wh-7'
                style={{ scale: '0.7' }}
                url={Assets.editor.widget.numberInput.operateUp}
              />
            </Flex>
            <Flex
              layout='c'
              className=''
              onMouseDown={() => emitNewValue((numberValue() - step).toString())}>
              <Icon
                className='wh-7'
                style={{ scale: '0.7', rotate: '180deg' }}
                url={Assets.editor.widget.numberInput.operateUp}
              />
            </Flex>
          </Flex>
        )
      })

      return (
        <Flex
          layout='h'
          className={cx('wh-92-28 r-2 box-border select-none pl-4', className)}
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
