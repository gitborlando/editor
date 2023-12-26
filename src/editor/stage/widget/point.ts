import { inject, injectable } from 'tsyringe'
import { SettingService, injectSetting } from '~/global/setting'
import { Watch, When, autobind } from '~/shared/decorator'
import { StageSelectService, injectStageSelect } from '../interact/select'
import { PIXI, PixiService, injectPixi } from '../pixi'
import { StageViewportService, injectStageViewport } from '../viewport'

@autobind
@injectable()
export class StageWidgetPointService {
  marqueeWidget = new PIXI.Graphics()
  constructor(
    @injectStageSelect private StageSelect: StageSelectService,
    @injectPixi private Pixi: PixiService,
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
    this.marqueeWidget.setParent(this.Pixi.sceneStage)
    const { x, y, width, height } = this.StageSelect.marquee

    // this.StageCTX.drawStroke(this.marqueeWidget, {
    //   width: 1 / this.StageViewport.zoom,
    //   color: this.Setting.color,
    // })
    // const realStart = this.StageViewport.toRealStageXY(XY.Of(x, y))
    // const realShift = this.StageViewport.toRealStageShift(XY.Of(width, height))
    // this.StageCTX.drawRect(realStart.x, realStart.y, realShift.x, realShift.y)
  }
}

export const injectStageWidgetMarquee = inject(StageWidgetPointService)
