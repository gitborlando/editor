import { Setting } from '~/global/setting'
import { autobind } from '~/shared/decorator'
import { XY } from '~/shared/structure/xy'
import { StageSelect } from '../interact/select'
import { PIXI, Pixi } from '../pixi'
import { StageViewport } from '../viewport'

@autobind
export class StageWidgetMarqueeService {
  marqueeElement = new PIXI.Graphics()
  initHook() {
    StageSelect.marquee.hook(this.autoDraw)
  }
  private autoDraw() {
    this.marqueeElement.clear()
    if (!StageSelect.marquee.value) return
    if (!this.marqueeElement.parent) {
      this.marqueeElement.setParent(Pixi.sceneStage)
    }
    const { x, y, width, height } = StageSelect.marquee.value
    const realStart = StageViewport.toRealStageXY(XY.Of(x, y))
    const realShift = StageViewport.toRealStageShiftXY(XY.Of(width, height))
    this.marqueeElement.lineStyle(1 / StageViewport.zoom.value, Setting.color.value)
    this.marqueeElement.drawRect(realStart.x, realStart.y, realShift.x, realShift.y)
  }
}

export const StageWidgetMarquee = new StageWidgetMarqueeService()
