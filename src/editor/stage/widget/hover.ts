import { inject, injectable } from 'tsyringe'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { SettingService, injectSetting } from '~/global/setting'
import { When, autobind } from '~/shared/decorator'
import { lastOne } from '~/shared/utils/normal'
import { StageDrawService, injectStageDraw } from '../draw/draw'
import { StageElementService, injectStageElement } from '../element'
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
    @injectStageElement private StageElement: StageElementService,
    @injectStageDraw private StageDraw: StageDrawService
  ) {
    this.initialize()
  }
  private get hoverId() {
    return lastOne(this.SchemaNode.hoverIds.value)
  }
  @When('StageViewport.initialized')
  private initialize() {
    this.SchemaNode.hoverIds.hook(this.autoDraw)
    this.StageViewport.duringZoom.hook(this.autoDraw)
  }
  private autoDraw() {
    if (!this.hoverId || this.SchemaNode.selectIds.value.has(this.hoverId)) {
      return this.hoverWidget.clear()
    }
    this.hoverWidget.clear()
    const hoverNode = this.SchemaNode.find(this.hoverId)
    const parent = this.StageElement.find(hoverNode.parentId) || this.Pixi.sceneStage
    this.hoverWidget.setParent(parent)
    if (hoverNode.type === 'vector') {
      this.hoverWidget.lineStyle(1.5 / this.StageViewport.zoom, this.Setting.color.value)
      this.StageDraw.drawShape(this.hoverWidget, hoverNode)
    }
  }
}

export const injectStageWidgetHover = inject(StageWidgetHoverService)
