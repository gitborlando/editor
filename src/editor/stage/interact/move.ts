import autobind from 'class-autobind-decorator'
import { StageCursor } from 'src/editor/stage/cursor'
import { Surface } from 'src/editor/stage/render/surface'
import { Drag } from 'src/global/event/drag'
import { collectDisposer } from 'src/utils/disposer'
import { StageViewport } from '../viewport'

@autobind
class StageMoveService {
  startInteract() {
    const disposer = collectDisposer(Surface.addEvent('mousedown', this.onMoveStage))
    Surface.disablePointEvent(false)
    StageCursor.setCursor('hand').lock()

    return () => {
      disposer()
      Surface.enablePointEvent()
      StageCursor.unlock().setCursor('select', 0)
    }
  }

  private onMoveStage() {
    const start = XY.from(StageViewport.offset)
    Drag.onStart(() => StageCursor.unlock().setCursor('grab').lock())
      .onMove(({ shift }) => (StageViewport.offset = start.plus(shift)))
      .onDestroy(() => StageCursor.unlock().setCursor('hand').lock())
  }
}

export const StageMove = new StageMoveService()
