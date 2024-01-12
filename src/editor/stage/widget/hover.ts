import { SchemaNode } from '~/editor/schema/node'
import { Setting } from '~/global/setting'
import { autobind } from '~/shared/decorator'
import { firstOne } from '~/shared/utils/array'
import { StageDraw } from '../draw/draw'
import { PIXI, Pixi } from '../pixi'
import { StageViewport } from '../viewport'

@autobind
export class StageWidgetHoverService {
  hoverWidget = new PIXI.Graphics()
  private get hoverId() {
    return firstOne(SchemaNode.hoverIds.value)
  }
  initHook() {
    SchemaNode.hoverIds.hook(this.autoDraw)
    StageViewport.duringZoom.hook(this.autoDraw)
  }
  private autoDraw() {
    if (!this.hoverId || SchemaNode.selectIds.value.has(this.hoverId)) {
      return this.hoverWidget.clear()
    }
    this.hoverWidget.clear()
    this.hoverWidget.setParent(Pixi.sceneStage)
    const hoverNode = SchemaNode.find(this.hoverId)
    if (hoverNode.type === 'vector') {
      this.hoverWidget.lineStyle(1.5 / StageViewport.zoom.value, Setting.color.value)
      StageDraw.drawShape(this.hoverWidget, hoverNode)
    }
  }
}

export const StageWidgetHover = new StageWidgetHoverService()
