import { Graphics } from '@pixi/react'
import { FC, memo, useState } from 'react'
import { PIXI } from '~/editor/stage/pixi'
import { StageViewport } from '~/editor/stage/viewport'
import { Drag } from '~/global/event/drag'
import { IXY } from '~/shared/utils/normal'

type IPointComp = {
  select: () => any
  onChangeXY: (shift: IXY) => any
  draw: (opt: { hovered: boolean }) => (g: PIXI.Graphics) => void
  onChangeEnd?: () => any
}

export const PointComp: FC<IPointComp> = memo(({ onChangeXY, select, draw, onChangeEnd }) => {
  const [hovered, setHovered] = useState(false)
  const onMouseDown = () => {
    Drag.onDown(select)
      .onMove(({ shift }) => onChangeXY(StageViewport.toSceneShift(shift)))
      .onDestroy(({ dragService }) => dragService.started && onChangeEnd?.())
  }

  return (
    <Graphics
      eventMode='dynamic'
      onmouseenter={() => setHovered(true)}
      onmouseleave={() => setHovered(false)}
      onmousedown={onMouseDown}
      draw={draw({ hovered })}
    />
  )
})

PointComp.displayName = 'PointComp'
