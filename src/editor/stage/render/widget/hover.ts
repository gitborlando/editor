import { OperateNode } from 'src/editor/operate/node'
import { Schema } from 'src/editor/schema/schema'
import { INode } from 'src/editor/schema/type'
import { NodeDrawer } from 'src/editor/stage/render/draw'
import { Elem } from 'src/editor/stage/render/elem'
import { StageScene } from 'src/editor/stage/render/scene'
import { Surface } from 'src/editor/stage/render/surface'
import { lastOne } from 'src/shared/utils/array'
import { SchemaUtil } from 'src/shared/utils/schema'

class StageWidgetHoverService {
  hoverWidget = new Elem()
  private get hoverId() {
    return lastOne(OperateNode.hoverIds.value)
  }
  initHook() {
    StageScene.widgetRoot.addChild(this.hoverWidget)

    this.hoverWidget.draw = () => {
      if (!this.hoverId || OperateNode.selectIds.value.has(this.hoverId)) return
      const hoverNode = Schema.find<INode>(this.hoverId)
      if (SchemaUtil.isPageFrame(hoverNode.id)) return

      NodeDrawer.drawOutline('hover', hoverNode)
    }

    OperateNode.hoverIds.hook(() => {
      Surface.requestRender()
      Surface.collectDirty(this.hoverWidget)
    })
  }
}

export const StageWidgetHover = new StageWidgetHoverService()
