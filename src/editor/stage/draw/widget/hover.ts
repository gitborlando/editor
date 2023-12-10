import { inject, injectable } from 'tsyringe'
import { Watch, When, autobind } from '~/editor/helper/decorator'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { SettingService, injectSetting } from '~/editor/utility/setting'
import { StageSelectService, injectStageSelect } from '../../interact/select'
import { PIXI, PixiService, injectPixi } from '../../pixi'
import { StageViewportService, injectStageViewport } from '../../viewport'
import { StageCTXService, injectStageCTX } from '../ctx/ctx'
import { customPixiCTX } from '../ctx/pixi-ctx'
import { StageDrawService, injectStageDraw } from '../draw'

@autobind
@injectable()
export class StageWidgetHoverService {
  hoverWidget = new PIXI.Graphics()
  constructor(
    @injectPixi private Pixi: PixiService,
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectStageCTX private StageCTX: StageCTXService,
    @injectStageViewport private StageViewport: StageViewportService,
    @injectStageDraw private StageDraw: StageDrawService,
    @injectStageSelect private StageSelect: StageSelectService,
    @injectSetting private Setting: SettingService
  ) {
    this.autoDraw()
  }
  @When('StageViewport.initialized')
  @Watch('SchemaNode.hoverId', 'StageViewport.zoom', 'StageSelect.marquee')
  private autoDraw() {
    if (
      !this.SchemaNode.hoverId ||
      this.SchemaNode.selectIds.has(this.SchemaNode.hoverId) ||
      this.StageSelect.marquee
    ) {
      return this.hoverWidget.clear()
    }
    this.hoverWidget.setParent(this.Pixi.stage)
    this.hoverWidget.clear()
    const node = this.SchemaNode.find(this.SchemaNode.hoverId)
    if (node.type === 'vector') {
      customPixiCTX(this.StageCTX, this.hoverWidget)
      this.StageCTX.drawStroke(this.hoverWidget, {
        width: 1.5 / this.StageViewport.zoom,
        color: this.Setting.color,
      })
      this.StageDraw.drawPath(this.hoverWidget, node)
    }
  }
}

export const injectStageWidgetHover = inject(StageWidgetHoverService)
