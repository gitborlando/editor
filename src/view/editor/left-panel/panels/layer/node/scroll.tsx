import { observer } from 'mobx-react'
import { FC } from 'react'
import { max } from '~/editor/math/base'
import { Drag } from '~/global/drag'
import { useAutoSignal, useSignal, useSignalHook } from '~/shared/signal-react'
import { makeStyles } from '../../../../../ui-utility/theme'
import { Flex } from '../../../../../ui-utility/widget/flex'

type IScrollComp = {
  contentHeight: number
  viewHeight: number
  scrollHeight: number
  hookScroll: (scrollHeight: number) => any
}

export const ScrollComp: FC<IScrollComp> = observer(
  ({ contentHeight, viewHeight, scrollHeight, hookScroll }) => {
    const width = useAutoSignal(4)
    const dragging = useSignal(false)
    const { classes } = useStyles({ width: width.value })
    const rate = contentHeight !== 0 ? viewHeight / contentHeight : 0
    const sliderHeight = max(24, viewHeight * rate)
    useSignalHook(dragging, (isDragging) => width.dispatch(isDragging ? 6 : 4))
    return (
      <Flex layout='v' className={classes.Scroll} style={{ height: viewHeight }}>
        <Flex
          className={classes.slider}
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

type IScrollCompStyle = { width: number } /* & Required<Pick<IScroll>> */ /* & Pick<IScroll> */

const useStyles = makeStyles<IScrollCompStyle>()((t, { width }) => ({
  Scroll: {
    ...t.rect(width, 0),
    ...t.absolute(undefined, 0, 0),
    cursor: 'pointer',
    '&:hover': {
      width: 6,
    },
  },
  slider: {
    ...t.rect('100%', 0, 'no-radius', 'rgba(204, 204, 204, 0.5)'),
    position: 'absolute',
  },
}))

ScrollComp.displayName = 'ScrollComp'
