import autobind from 'class-autobind-decorator'
import { PIXI, Pixi } from '../pixi'
import { StageViewport } from '../viewport'

@autobind
class StageWidgetGuideService {
  v = new PIXI.Graphics()
  h = new PIXI.Graphics()
  private draw() {
    this.v.clear()
    this.h.clear()
    this.v.lineStyle(0.5 / StageViewport.zoom.value, 'red')
    this.v.moveTo(0, -100000)
    this.v.lineTo(0, 100000)
    this.h.lineStyle(0.5 / StageViewport.zoom.value, 'red')
    this.h.moveTo(-100000, 0)
    this.h.lineTo(100000, 0)
    Pixi.sceneStage.addChild(this.v)
    Pixi.sceneStage.addChild(this.h)
  }
}

export const StageWidgetGuide = new StageWidgetGuideService()
