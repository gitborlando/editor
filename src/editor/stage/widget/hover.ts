import { inject, injectable } from 'tsyringe'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { SettingService, injectSetting } from '~/global/setting'
import { Watch, When, autobind } from '~/shared/decorator'
import { StageDrawService, injectStageDraw } from '../draw/draw'
import { StageDrawPathService, injectStageDrawPath } from '../draw/path'
import { PIXI, PixiService, injectPixi } from '../pixi'
import { StageViewportService, injectStageViewport } from '../viewport'

@autobind
@injectable()
export class StageWidgetHoverService {
  hoverWidget = new PIXI.Graphics()
  constructor(
    @injectPixi private Pixi: PixiService,
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectStageViewport private StageViewport: StageViewportService,
    @injectSetting private Setting: SettingService,
    @injectStageDrawPath private StageDrawPath: StageDrawPathService,
    @injectStageDraw private StageDraw: StageDrawService
  ) {
    this.autoDraw()
  }
  @When('StageViewport.initialized')
  @Watch('SchemaNode.hoverId', 'StageViewport.zoom')
  private autoDraw() {
    if (!this.SchemaNode.hoverId || this.SchemaNode.selectIds.has(this.SchemaNode.hoverId)) {
      return this.hoverWidget.clear()
    }
    this.hoverWidget.clear()
    this.hoverWidget.setParent(this.Pixi.sceneStage)
    const node = this.SchemaNode.find(this.SchemaNode.hoverId)
    if (node.type === 'vector') {
      this.hoverWidget.lineStyle(1.5 / this.StageViewport.zoom, this.Setting.color)
      this.StageDraw.drawShape(this.hoverWidget, node)
    }
  }
}

export const injectStageWidgetHover = inject(StageWidgetHoverService)
