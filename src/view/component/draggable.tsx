import { observer, useLocalObservable } from 'mobx-react'
import { FC, ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { xy_new } from '~/editor/math/xy'
import { Drag } from '~/global/event/drag'
import { createSignal } from '~/shared/signal'
import { useAutoSignal } from '~/shared/signal-react'
import { XY } from '~/shared/structure/xy'
import { IXY } from '~/shared/utils/normal'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import Asset from '../ui-utility/assets'
import { Button } from '../ui-utility/widget/button'
import { Icon } from '../ui-utility/widget/icon'

type IDraggableComp = {
  closeFunc: () => void
  children: ReactNode
  xy?: IXY
  headerSlot?: ReactNode
  width?: number
  height?: number
  onXYChange?(newXY: IXY): void
}

let draggableCount = 0
const maxZIndex = createSignal(0)

export const DraggableComp: FC<IDraggableComp> = observer(
  ({ closeFunc, children, xy, headerSlot, width, height, onXYChange }) => {
    const { classes } = useStyles({})
    const state = useLocalObservable(() => ({
      xy: xy || xy_new(480, 240),
    }))
    const zIndex = useAutoSignal(0)
    useEffect(() => {
      draggableCount++
      maxZIndex.value++
      return () => void draggableCount--
    }, [])
    return createPortal(
      <Flex
        layout='v'
        className={classes.Draggable}
        style={{
          left: state.xy.x,
          top: state.xy.y,
          ...(width && { width }),
          ...(height && { height }),
          zIndex: zIndex.value,
        }}
        onMouseDownCapture={() => {
          draggableCount > 1 && zIndex.dispatch(maxZIndex.value++)
        }}>
        <Flex
          layout='h'
          shrink={0}
          className={classes.header}
          justify='space-between'
          onMouseDown={() => {
            const start = state.xy
            const { innerWidth, innerHeight } = window
            Drag.onSlide(({ shift, current }) => {
              if (current.x > innerWidth || current.y > innerHeight) return
              state.xy = XY.From(start).plus(shift)
              onXYChange?.(state.xy)
            })
          }}>
          {headerSlot}
          <Button
            type='icon'
            onMouseDown={(e) => e.stopPropagation()}
            onClick={closeFunc}
            style={{ marginLeft: 'auto', cursor: 'pointer' }}>
            <Icon size={16} rotate={45}>
              {Asset.editor.leftPanel.page.add}
            </Icon>
          </Button>
        </Flex>
        {children}
      </Flex>,
      document.querySelector('#draggable-portal')!
    )
  }
)

type IDraggableCompStyle = {} /* & Required<Pick<IDraggableComp>> */ /* & Pick<IDraggableComp> */

const useStyles = makeStyles<IDraggableCompStyle>()((t) => ({
  Draggable: {
    ...t.rect(240, 'fit-content', 6, 'white'),
    ...t.fixed(),
    overflow: 'hidden',
    boxShadow: '0px 0px 4px  rgba(0, 0, 0, 0.25)',
  },
  header: {
    ...t.rect('100%', 30),
    ...t.default$.borderBottom,
    paddingLeft: 10,
    paddingRight: 4,
  },
}))

DraggableComp.displayName = 'DraggableComp'
