import { observer, useLocalObservable } from 'mobx-react'
import { FC, ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { xy_ } from '~/editor/math/xy'
import { Drag } from '~/global/event/drag'
import { createSignal } from '~/shared/signal/signal'
import { useAutoSignal } from '~/shared/signal/signal-react'
import { useClickAway } from '~/shared/utils/event'
import { IXY } from '~/shared/utils/normal'
import { XY } from '~/shared/xy'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import Asset from '../ui-utility/assets'
import { Button } from '../ui-utility/widget/button'
import { Icon } from '../ui-utility/widget/icon'

type IDraggableComp = {
  children: ReactNode
  xy?: IXY
  headerSlot?: ReactNode
  width?: number
  height?: number
  closeFunc: () => void
  clickAwayClose?: () => boolean
  onXYChange?(newXY: IXY): void
}

let draggableCount = 0
const maxZIndex = createSignal(0)

export const DraggableComp: FC<IDraggableComp> = observer(
  ({ closeFunc, clickAwayClose, children, xy, headerSlot, width, height, onXYChange }) => {
    const ref = useRef<HTMLDivElement>(null)
    const { classes } = useStyles({})
    const state = useLocalObservable(() => ({
      xy: xy || xy_(480, 240),
    }))
    const zIndex = useAutoSignal(0)
    useEffect(() => {
      draggableCount++
      maxZIndex.value++
      return () => void draggableCount--
    }, [])
    useClickAway({
      when: () => !!clickAwayClose?.(),
      insideTest: (dom) => dom === ref.current,
      callback: () => closeFunc(),
    })
    return createPortal(
      <Flex
        layout='v'
        className={classes.Draggable}
        ref={ref}
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
