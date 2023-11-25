import { inject, injectable } from 'tsyringe'
import { DragService, injectDrag } from '~/editor/drag'
import { XY } from '~/editor/math/xy'
import { autobind } from '~/helper/decorator'
import { noopFunc } from '~/helper/utils'
import { PixiService, injectPixi } from '../pixi'
import { listenInteractTypeChange } from '../stage'
import { ViewportService, injectViewport } from '../viewport'

@autobind
@injectable()
export class StageMoveService {
  private startHandler = noopFunc
  constructor(
    @injectPixi private pixiService: PixiService,
    @injectDrag private dragService: DragService,
    @injectViewport private viewportService: ViewportService
  ) {
    listenInteractTypeChange(this, 'move')
  }
  startInteract() {
    this.startHandler = () => {
      const start = XY.from(this.pixiService.stage.position)
      this.dragService.onSlide(({ shift }) => {
        this.viewportService.setStageOffset(start.plus(shift))
      })
    }
    this.pixiService.addListener('mousedown', this.startHandler)
  }
  endInteract() {
    this.pixiService.removeListener('mousedown', this.startHandler)
  }
}

export const injectStageMove = inject(StageMoveService)
