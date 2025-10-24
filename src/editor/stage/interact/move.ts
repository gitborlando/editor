import autobind from 'class-autobind-decorator'
import { StageCursor } from 'src/editor/stage/cursor'
import { Surface } from 'src/editor/stage/render/surface'
import { Drag } from 'src/global/event/drag'
import { StageViewport } from '../viewport'

@autobind
class StageMoveService {
  startInteract() {
    Surface.disablePointEvent(false)
    Surface.addEvent('mousedown', this.onMoveStage)
    StageCursor.setCursor('hand').lock()
  }

  endInteract() {
    Surface.enablePointEvent()
    Surface.removeEvent('mousedown', this.onMoveStage)
    StageCursor.unlock().setCursor('select', 0)
  }

  private onMoveStage() {
    const start = XY.from(StageViewport.offset)
    Drag.onDown(() => StageCursor.unlock().setCursor('grab').lock())
      .onMove(({ shift }) => (StageViewport.offset = start.plus(shift)))
      .onDestroy(() => StageCursor.unlock().setCursor('hand').lock())
  }
}

export const StageMove = new StageMoveService()
