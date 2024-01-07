import { observer, useLocalObservable } from 'mobx-react'
import { FC } from 'react'
import { max } from '~/editor/math/base'
import { useAutoRun } from '~/shared/utils/mobx'
import { useGlobalService } from '../../../../../context'
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
    const { Drag } = useGlobalService()
    const state = useLocalObservable(() => ({
      width: 4,
      dragging: false,
    }))
    const { classes } = useStyles({ width: state.width })
    const rate = contentHeight !== 0 ? viewHeight / contentHeight : 0
    const sliderHeight = max(24, viewHeight * rate)
    useAutoRun(() => (state.width = state.dragging ? 6 : 4))
    return (
      <Flex layout='v' className={classes.Scroll} style={{ height: viewHeight }}>
        <Flex
          className={classes.slider}
          style={{ height: sliderHeight, top: scrollHeight * rate }}
          onMouseDown={() => {
            Drag.onStart(() => (state.dragging = true))
              .onMove(({ shift }) => hookScroll(scrollHeight + shift.y / rate))
              .onDestroy(() => (state.dragging = false))
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
