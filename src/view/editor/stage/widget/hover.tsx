import { Graphics } from '@pixi/react'
import { FC, memo } from 'react'
import { OperateNode } from '~/editor/operate/node'
import { SchemaDefault } from '~/editor/schema/default'
import { Schema } from '~/editor/schema/schema'
import { INode } from '~/editor/schema/type'
import { SchemaUtil } from '~/editor/schema/util'
import { StageDraw } from '~/editor/stage/draw/draw'
import { StageInteract } from '~/editor/stage/interact/interact'
import { PIXI } from '~/editor/stage/pixi'
import { StageViewport } from '~/editor/stage/viewport'
import { useHookSignal } from '~/shared/signal/signal-react'
import { hslBlueColor } from '~/shared/utils/color'
import { lastOne } from '~/shared/utils/list'

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
    if (hoverNode.type === 'frame' && SchemaUtil.isPage(hoverNode.parentId)) return
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
