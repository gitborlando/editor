import { FC, ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { xy_, xy_plus } from '~/editor/math/xy'
import { Drag } from '~/global/event/drag'
import { createSignal } from '~/shared/signal/signal'
import { useAutoSignal } from '~/shared/signal/signal-react'
import { useClickAway } from '~/shared/utils/event'
import { IXY } from '~/shared/utils/normal'
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
      className={'lay-v wh-240-fit-6 bg-white fixed of-hidden shadow-4-0-rgba(0,0,0,0.25)'}
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
        className={'lay-h-0 wh-100%-30 justify-between borderBottom pl-10 pr-4'}
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

DraggableComp.displayName = 'DraggableComp'
