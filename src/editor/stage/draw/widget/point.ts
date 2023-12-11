import { inject, injectable } from 'tsyringe'
import { SettingService, injectSetting } from '~/editor/utility/setting'
import { Watch, When, autobind } from '~/shared/decorator'
import { XY } from '~/shared/xy'
import { StageSelectService, injectStageSelect } from '../../interact/select'
import { PIXI, PixiService, injectPixi } from '../../pixi'
import { StageViewportService, injectStageViewport } from '../../viewport'
import { StageCTXService, injectStageCTX } from '../ctx/ctx'
import { customPixiCTX } from '../ctx/pixi-ctx'

@autobind
@injectable()
export class StageWidgetPointService {
  marqueeWidget = new PIXI.Graphics()
  constructor(
    @injectStageSelect private StageSelect: StageSelectService,
    @injectPixi private Pixi: PixiService,
    @injectStageCTX private StageCTX: StageCTXService,
    @injectStageViewport private StageViewport: StageViewportService,
    @injectSetting private Setting: SettingService
  ) {
    this.autoDraw()
  }
  @When('Pixi.initialized')
  @Watch('StageSelect.marquee')
  private autoDraw() {
    if (!this.StageSelect.marquee) {
      return this.marqueeWidget.clear()
    }
    this.marqueeWidget.clear()
    this.marqueeWidget.setParent(this.Pixi.stage)
    const { x, y, width, height } = this.StageSelect.marquee
    customPixiCTX(this.StageCTX, this.marqueeWidget)
    this.StageCTX.drawStroke(this.marqueeWidget, {
      width: 1 / this.StageViewport.zoom,
      color: this.Setting.color,
    })
    const realStart = this.StageViewport.toRealStageXY(XY.Of(x, y))
    const realShift = this.StageViewport.toRealStageShift(XY.Of(width, height))
    this.StageCTX.drawRect(realStart.x, realStart.y, realShift.x, realShift.y)
  }
}

export const injectStageWidgetMarquee = inject(StageWidgetPointService)
