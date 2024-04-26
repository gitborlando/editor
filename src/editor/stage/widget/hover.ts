import autobind from 'class-autobind-decorator'
import { OperateNode } from '~/editor/operate/node'
import { Schema } from '~/editor/schema/schema'
import { INode } from '~/editor/schema/type'
import { SchemaUtil } from '~/editor/schema/util'
import { hslBlueColor } from '~/shared/utils/color'
import { lastOne } from '~/shared/utils/list'
import { StageDraw } from '../draw/draw'
import { StageInteract } from '../interact/interact'
import { PIXI, Pixi } from '../pixi'
import { StageViewport } from '../viewport'

@autobind
export class StageWidgetHoverService {
  hoverWidget = new PIXI.Graphics()
  private get hoverId() {
    return lastOne(OperateNode.hoverIds.value)
  }
  initHook() {
    OperateNode.hoverIds.hook(this.autoDraw)
    StageInteract.canHover.hook(this.autoDraw)
    StageViewport.duringZoom.hook(this.autoDraw)
  }
  private autoDraw() {
    this.hoverWidget.clear()
    if (!this.hoverId) return
    if (!StageInteract.canHover.value) return
    if (OperateNode.selectIds.value.has(this.hoverId)) return
    this.hoverWidget.setParent(Pixi.sceneStage)
    const hoverNode = Schema.find<INode>(this.hoverId)
    if (hoverNode.type === 'frame' && SchemaUtil.isPage(hoverNode.parentId)) return
    this.hoverWidget.lineStyle(1.5 / StageViewport.zoom.value, hslBlueColor(65))
    StageDraw.drawShape(this.hoverWidget, hoverNode)
  }
}

export const StageWidgetHover = new StageWidgetHoverService()
