import { FC, memo } from 'react'
import { max } from '~/editor/math/base'
import { Drag } from '~/global/event/drag'
import { useAutoSignal, useHookSignal, useSignal } from '~/shared/signal/signal-react'
import { Flex } from '../../../../../ui-utility/widget/flex'

type IScrollComp = {
  contentHeight: number
  viewHeight: number
  scrollHeight: number
  hookScroll: (scrollHeight: number) => any
}

export const ScrollComp: FC<IScrollComp> = memo(
  ({ contentHeight, viewHeight, scrollHeight, hookScroll }) => {
    const width = useAutoSignal(4)
    const dragging = useSignal(false)
    const rate = contentHeight !== 0 ? viewHeight / contentHeight : 0
    const sliderHeight = max(24, viewHeight * rate)
    useHookSignal(dragging, (isDragging) => width.dispatch(isDragging ? 6 : 4))
    return (
      <Flex
        className='lay-v absolute right-0 bottom-0 pointer hover:w-6'
        style={{ width: width.value, height: viewHeight }}>
        <Flex
          className='wh-100%-0 bg-[rgba(204,204,204,0.5)] absolute'
          style={{ height: sliderHeight, top: scrollHeight * rate }}
          onMouseDown={() => {
            Drag.onStart(() => dragging.dispatch(true))
              .onMove(({ shift }) => hookScroll(scrollHeight + shift.y / rate))
              .onDestroy(() => dragging.dispatch(false))
          }}></Flex>
      </Flex>
    )
  }
)
