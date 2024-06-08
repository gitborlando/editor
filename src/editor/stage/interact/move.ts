import autobind from 'class-autobind-decorator'
import { xy_from, xy_plus } from 'src/editor/math/xy'
import { StageCursor } from 'src/editor/stage/cursor'
import { Surface } from 'src/editor/stage/render/surface'
import { Drag } from 'src/global/event/drag'
import { StageViewport } from '../viewport'

@autobind
class StageMoveService {
  startInteract() {
    Surface.addEvent('mousedown', this.onMoveStage)
    StageCursor.setCursor('move').lock()
  }
  endInteract() {
    Surface.removeEvent('mousedown', this.onMoveStage)
    StageCursor.unlock().setCursor('select', 0)
  }
  private onMoveStage() {
    const start = xy_from(StageViewport.stageOffset.value)
    Drag.onSlide(({ shift }) => {
      StageViewport.stageOffset.dispatch(xy_plus(start, shift))
    })
  }
}

export const StageMove = new StageMoveService()
