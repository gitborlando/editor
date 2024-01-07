import { observer, useLocalObservable } from 'mobx-react'
import { FC, ReactNode } from 'react'
import { xy_new } from '~/editor/math/xy'
import { XY } from '~/shared/structure/xy'
import { IXY } from '~/shared/utils/normal'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { useGlobalService } from '../context'
import { Button } from '../ui-utility/widget/button'

type IDraggableComp = {
  closeFunc: () => void
  children: ReactNode
  xy?: IXY
  headerSlot?: ReactNode
}

export const DraggableComp: FC<IDraggableComp> = observer(
  ({ closeFunc, children, xy, headerSlot }) => {
    const { classes } = useStyles({})
    const { Drag } = useGlobalService()
    const state = useLocalObservable(() => ({
      xy: xy || xy_new(480, 240),
    }))
    return (
      <Flex layout='v' className={classes.Draggable} style={{ left: state.xy.x, top: state.xy.y }}>
        <Flex
          layout='h'
          className={classes.header}
          justify='space-between'
          sidePadding={4}
          onMouseDown={() => {
            const start = state.xy
            const { innerWidth, innerHeight } = window
            Drag.onSlide(({ shift, current }) => {
              if (current.x > innerWidth || current.y > innerHeight) return
              state.xy = XY.From(start).plus(shift)
            })
          }}>
          {headerSlot}
          <Button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={closeFunc}
            style={{ marginLeft: 'auto', cursor: 'pointer' }}>
            关闭
          </Button>
        </Flex>
        {children}
      </Flex>
    )
  }
)

type IDraggableCompStyle = {} /* & Required<Pick<IDraggableComp>> */ /* & Pick<IDraggableComp> */

const useStyles = makeStyles<IDraggableCompStyle>()((t) => ({
  Draggable: {
    ...t.rect('fit-content', 'fit-content', 6, 'white'),
    ...t.fixed(),
    overflow: 'hidden',
    boxShadow: '0px 0px 4px  rgba(0, 0, 0, 0.25)',
  },
  header: {
    ...t.rect('100%', 30),
    ...t.default$.borderBottom,
    cursor: 'move',
  },
}))

DraggableComp.displayName = 'DraggableComp'
