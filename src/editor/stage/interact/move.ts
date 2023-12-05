import { inject, injectable } from 'tsyringe'
import { DragService, injectDrag } from '~/editor/drag'
import { XY } from '~/editor/math/xy'
import { autobind } from '~/editor/utility/decorator'
import { PixiService, injectPixi } from '../pixi'
import { listenInteractTypeChange } from '../stage'
import { ViewportService, injectViewport } from '../viewport'

@autobind
@injectable()
export class StageMoveService {
  constructor(
    @injectPixi private pixiService: PixiService,
    @injectDrag private dragService: DragService,
    @injectViewport private viewportService: ViewportService
  ) {
    listenInteractTypeChange(this, 'move')
  }
  startInteract() {
    this.pixiService.addListener('mousedown', this.onMoveStage)
  }
  endInteract() {
    this.pixiService.removeListener('mousedown', this.onMoveStage)
  }
  private onMoveStage() {
    const start = XY.From(this.pixiService.stage.position)
    this.dragService.onSlide(({ shift }) => {
      this.viewportService.setStageOffset(start.plus(shift))
    })
  }
}

export const injectStageMove = inject(StageMoveService)
