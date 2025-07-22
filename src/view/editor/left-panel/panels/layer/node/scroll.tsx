import { Flex } from '@gitborlando/widget'
import { FC, memo } from 'react'
import { max } from 'src/editor/math/base'
import { Surface } from 'src/editor/stage/render/surface'
import { Drag } from 'src/global/event/drag'
import { useAutoSignal, useHookSignal, useSignal } from 'src/shared/signal/signal-react'

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
        layout='v'
        className='absolute right-0 bottom-0 pointer hover:w-6'
        style={{ width: width.value, height: viewHeight }}>
        <Flex
          className='wh-100%-0 bg-[rgba(204,204,204,0.5)] absolute'
          style={{ height: sliderHeight, top: scrollHeight * rate }}
          onMouseDown={() => {
            Surface.disablePointEvent()

            Drag.onStart(() => {
              dragging.dispatch(true)
            })
              .onMove(({ shift }) => {
                hookScroll(scrollHeight + shift.y / rate)
              })
              .onDestroy(() => {
                dragging.dispatch(false)
              })
          }}></Flex>
      </Flex>
    )
  }
)
