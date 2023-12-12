import { inject, injectable } from 'tsyringe'
import { SettingService, injectSetting } from '~/global/setting'
import { Watch, When, autobind } from '~/shared/decorator'
import { XY } from '~/shared/structure/xy'
import { StageSelectService, injectStageSelect } from '../../interact/select'
import { PIXI, PixiService, injectPixi } from '../../pixi'
import { StageViewportService, injectStageViewport } from '../../viewport'

@autobind
@injectable()
export class StageWidgetMarqueeService {
  marqueeElement = new PIXI.Graphics()
  constructor(
    @injectStageSelect private StageSelect: StageSelectService,
    @injectPixi private Pixi: PixiService,
    @injectStageViewport private StageViewport: StageViewportService,
    @injectSetting private Setting: SettingService
  ) {
    this.autoDraw()
  }
  @When('StageViewport.initialized')
  @Watch('StageSelect.marquee')
  private autoDraw() {
    this.marqueeElement.clear()
    if (!this.StageSelect.marquee) return
    if (!this.marqueeElement.parent) {
      this.marqueeElement.setParent(this.Pixi.stage)
    }

    const { x, y, width, height } = this.StageSelect.marquee
    const realStart = this.StageViewport.toRealStageXY(XY.Of(x, y))
    const realShift = this.StageViewport.toRealStageShift(XY.Of(width, height))

    this.marqueeElement.lineStyle(1 / this.StageViewport.zoom, this.Setting.color)
    this.marqueeElement.drawRect(realStart.x, realStart.y, realShift.x, realShift.y)
  }
}

export const injectStageWidgetMarquee = inject(StageWidgetMarqueeService)
