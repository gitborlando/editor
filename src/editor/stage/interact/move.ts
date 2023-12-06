import { inject, injectable } from 'tsyringe'
import { DragService, injectDrag } from '~/editor/drag'
import { XY } from '~/editor/math/xy'
import { autobind } from '~/editor/utility/decorator'
import { PixiService, injectPixi } from '../pixi'
import { StageViewportService, injectStageViewport } from '../viewport'

@autobind
@injectable()
export class StageMoveService {
  constructor(
    @injectPixi private Pixi: PixiService,
    @injectDrag private Drag: DragService,
    @injectStageViewport private StageViewport: StageViewportService
  ) {}
  startInteract() {
    this.Pixi.addListener('mousedown', this.onMoveStage)
  }
  endInteract() {
    this.Pixi.removeListener('mousedown', this.onMoveStage)
  }
  private onMoveStage() {
    const start = XY.From(this.Pixi.stage.position)
    this.Drag.onSlide(({ shift }) => {
      this.StageViewport.setStageOffset(start.plus(shift))
    })
  }
}

export const injectStageMove = inject(StageMoveService)
