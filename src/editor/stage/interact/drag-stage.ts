import { DragService } from '~/editor/drag'
import { XY } from '~/editor/math/xy'
import { autoBind } from '~/helper/decorator'
import { noopFunc } from '~/helper/utils'
import { PixiService } from '../pixi'
import { listenInteractTypeChange } from '../stage'
import { ViewportService } from '../viewport'

@autoBind
export class StageInteractDragStageService {
  private startHandler = noopFunc
  constructor(
    private pixiService: PixiService,
    private dragService: DragService,
    private viewportService: ViewportService
  ) {
    listenInteractTypeChange(this, 'dragStage')
  }
  startInteract() {
    this.startHandler = () => {
      const start = XY.from(this.pixiService.stage.position)
      console.log(start)
      this.dragService
        .setCursor('grab')
        .onStart()
        .onMove(({ shift }) => {
          this.viewportService.setStageOffset(start.plus(shift))
        })
        .onEnd(({ shift, dragService }) => {
          this.viewportService.setStageOffset(start.plus(shift))
          dragService.endListen()
        })
    }
    this.pixiService.addListener('mousedown', this.startHandler)
  }
  endInteract() {
    this.pixiService.removeListener('mousedown', this.startHandler)
  }
}
