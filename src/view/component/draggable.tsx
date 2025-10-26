import { Flex, Icon } from '@gitborlando/widget'
import { FC, ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { xy_, xy_plus } from 'src/editor/math/xy'
import { Drag } from 'src/global/event/drag'
import { useAutoSignal } from 'src/shared/signal/signal-react'
import { useClickAway } from 'src/shared/utils/event'
import { IXY } from 'src/shared/utils/normal'
import { Button } from '../ui-utility/widget/button'

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
const maxZIndex = Signal.create(0)

export const DraggableComp: FC<IDraggableComp> = ({
  closeFunc,
  clickAwayClose,
  children,
  xy,
  headerSlot,
  width,
  height,
  onXYChange,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(xy || xy_(480, 240))
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
      className={'wh-240-fit r-6 bg-white fixed of-hidden shadow-4-0-rgba(0,0,0,0.25)'}
      ref={ref}
      style={{
        left: position.x,
        top: position.y,
        ...(width && { width }),
        ...(height && { height }),
        zIndex: zIndex.value,
      }}
      onMouseDownCapture={() => {
        draggableCount > 1 && zIndex.dispatch(maxZIndex.value++)
      }}>
      <Flex
        layout='h'
        className={'wh-100%-30 justify-between borderBottom pl-10 pr-4'}
        onMouseDown={() => {
          const start = position
          const { innerWidth, innerHeight } = window
          Drag.onSlide(({ shift, current }) => {
            if (current.x > innerWidth || current.y > innerHeight) return
            setPosition(xy_plus(start, shift))
            onXYChange?.(position)
          })
        }}>
        {headerSlot}
        <Button
          type='icon'
          onMouseDown={(e) => e.stopPropagation()}
          onClick={closeFunc}
          className='ml-auto pointer'>
          <Icon className='wh-16' url={Assets.editor.leftPanel.page.add} />
        </Button>
      </Flex>
      {children}
    </Flex>,
    document.querySelector('#draggable-portal')!,
  )
}

DraggableComp.displayName = 'DraggableComp'
