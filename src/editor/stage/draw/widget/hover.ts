import { inject, injectable } from 'tsyringe'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { SettingService, injectSetting } from '~/global/setting'
import { Watch, When, autobind } from '~/shared/decorator'
import { PIXI, PixiService, injectPixi } from '../../pixi'
import { StageViewportService, injectStageViewport } from '../../viewport'
import { StageDrawService, injectStageDraw } from '../draw'

@autobind
@injectable()
export class StageWidgetHoverService {
  hoverWidget = new PIXI.Graphics()
  constructor(
    @injectPixi private Pixi: PixiService,
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectStageViewport private StageViewport: StageViewportService,
    @injectStageDraw private StageDraw: StageDrawService,
    @injectSetting private Setting: SettingService
  ) {
    this.autoDraw()
  }
  @When('StageViewport.initialized')
  @Watch('SchemaNode.hoverId', 'StageViewport.zoom')
  private autoDraw() {
    if (!this.SchemaNode.hoverId || this.SchemaNode.selectIds.has(this.SchemaNode.hoverId)) {
      return this.hoverWidget.clear()
    }
    this.hoverWidget.setParent(this.Pixi.stage)
    this.hoverWidget.clear()
    const node = this.SchemaNode.find(this.SchemaNode.hoverId)
    if (node.type === 'vector') {
      this.hoverWidget.lineStyle(1.5 / this.StageViewport.zoom, this.Setting.color)
      this.StageDraw.drawPath(this.hoverWidget, node)
    }
  }
}

export const injectStageWidgetHover = inject(StageWidgetHoverService)
