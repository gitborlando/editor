import { Graphics } from '@pixi/react'
import { FC, memo } from 'react'
import { OperateNode } from 'src/editor/operate/node'
import { SchemaDefault } from 'src/editor/schema/default'
import { Schema } from 'src/editor/schema/schema'
import { INode } from 'src/editor/schema/type'
import { StageDraw } from 'src/editor/stage/draw/draw'
import { StageInteract } from 'src/editor/stage/interact/interact'
import { PIXI } from 'src/editor/stage/pixi'
import { StageViewport } from 'src/editor/stage/viewport'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { lastOne } from 'src/shared/utils/array'
import { hslBlueColor } from 'src/shared/utils/color'
import { SchemaUtil } from 'src/shared/utils/schema'

type IHoverComp = {}

export const HoverComp: FC<IHoverComp> = memo(({}) => {
  useHookSignal(OperateNode.hoverIds)
  useHookSignal(StageInteract.canHover)
  useHookSignal(StageViewport.duringZoom)
  const hoverId = lastOne(OperateNode.hoverIds.value)

  const draw = (graphic: PIXI.Graphics) => {
    graphic.clear()
    if (!hoverId) return
    if (!StageInteract.canHover.value) return
    if (OperateNode.selectIds.value.has(hoverId)) return
    const hoverNode = Schema.find<INode>(hoverId)
    if (hoverNode.type === 'frame' && SchemaUtil.isPageById(hoverNode.parentId)) return
    graphic.lineStyle(1.5 / StageViewport.zoom.value, hslBlueColor(65))
    if (hoverNode.type === 'text') {
      const rect = SchemaDefault.rect({ ...hoverNode, type: 'vector' })
      StageDraw.drawShape(graphic, rect)
    } else {
      StageDraw.drawShape(graphic, hoverNode)
    }
  }

  return <Graphics draw={draw} />
})

HoverComp.displayName = 'HoverComp'
