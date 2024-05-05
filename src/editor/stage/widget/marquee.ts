import autobind from 'class-autobind-decorator'
import { hslBlueColor } from '~/shared/utils/color'
import { XY } from '~/shared/xy'
import { StageSelect } from '../interact/select'
import { PIXI, Pixi } from '../pixi'
import { StageViewport } from '../viewport'

@autobind
class StageWidgetMarqueeService {
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
    const sceneStartXY = StageViewport.toSceneStageXY(XY.Of(x, y))
    const sceneShiftXY = StageViewport.toSceneStageShiftXY(XY.Of(width, height))
    this.marqueeElement.beginFill(hslBlueColor(65), 0.1)
    this.marqueeElement.lineStyle(1 / StageViewport.zoom.value, hslBlueColor(65))
    this.marqueeElement.drawRect(sceneStartXY.x, sceneStartXY.y, sceneShiftXY.x, sceneShiftXY.y)
  }
}

export const StageWidgetMarquee = new StageWidgetMarqueeService()
