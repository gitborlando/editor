import { inject, injectable } from 'tsyringe'
import { Watch, When, autobind } from '~/shared/decorator'
import { PIXI, PixiService, injectPixi } from '../pixi'
import { StageViewportService, injectStageViewport } from '../viewport'

@autobind
@injectable()
export class StageWidgetGuideService {
  v = new PIXI.Graphics()
  h = new PIXI.Graphics()
  constructor(
    @injectPixi private Pixi: PixiService,
    @injectStageViewport private StageViewport: StageViewportService
  ) {
    this.draw()
  }
  @When('Pixi.initialized')
  @Watch('StageViewport.zoom')
  private draw() {
    this.v.clear()
    this.h.clear()
    this.v.lineStyle(0.5 / this.StageViewport.zoom, 'red')
    this.v.moveTo(0, -100000)
    this.v.lineTo(0, 100000)
    this.h.lineStyle(0.5 / this.StageViewport.zoom, 'red')
    this.h.moveTo(-100000, 0)
    this.h.lineTo(100000, 0)
    this.Pixi.sceneStage.addChild(this.v)
    this.Pixi.sceneStage.addChild(this.h)
  }
}

export const injectStageWidgetGuide = inject(StageWidgetGuideService)
