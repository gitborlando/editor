import autobind from 'class-autobind-decorator'
import { xy_from, xy_plus } from 'src/editor/math/xy'
import { Surface } from 'src/editor/stage/render/surface'
import { Drag } from 'src/global/event/drag'
import { StageViewport } from '../viewport'

@autobind
class StageMoveService {
  startInteract() {
    Surface.addEvent('mousedown', this.onMoveStage)
  }
  endInteract() {
    Surface.removeEvent('mousedown', this.onMoveStage)
  }
  private onMoveStage() {
    const start = xy_from(StageViewport.stageOffset.value)
    Drag.onSlide(({ shift }) => {
      StageViewport.stageOffset.dispatch(xy_plus(start, shift))
    })
  }
}

export const StageMove = new StageMoveService()
