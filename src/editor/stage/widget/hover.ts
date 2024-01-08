import { SchemaNode } from '~/editor/schema/node'
import { Setting } from '~/global/setting'
import { autobind } from '~/shared/decorator'
import { lastOne } from '~/shared/utils/array'
import { StageDraw } from '../draw/draw'
import { StageElement } from '../element'
import { PIXI, Pixi } from '../pixi'
import { StageViewport } from '../viewport'

@autobind
export class StageWidgetHoverService {
  hoverWidget = new PIXI.Graphics()
  private get hoverId() {
    return lastOne(SchemaNode.hoverIds.value)
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
    const hoverNode = SchemaNode.find(this.hoverId)
    const parent = StageElement.find(hoverNode.parentId) || Pixi.sceneStage
    this.hoverWidget.setParent(parent)
    if (hoverNode.type === 'vector') {
      this.hoverWidget.lineStyle(1.5 / StageViewport.zoom.value, Setting.color.value)
      StageDraw.drawShape(this.hoverWidget, hoverNode)
    }
  }
}

export const StageWidgetHover = new StageWidgetHoverService()
