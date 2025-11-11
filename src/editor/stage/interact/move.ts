import autobind from 'class-autobind-decorator'
import { StageCursor } from 'src/editor/stage/cursor'
import { Surface } from 'src/editor/stage/render/surface'
import { Drag } from 'src/global/event/drag'
import { StageViewport } from '../viewport'

@autobind
class StageMoveService {
  startInteract() {
    const disposer = Disposer.collect(
      Surface.addEvent('mousedown', this.onMoveStage),
    )
    Surface.disablePointEvent(false)
    StageCursor.setCursor('hand').lock()

    return () => {
      disposer()
      Surface.enablePointEvent()
      StageCursor.unlock().setCursor('select', 0)
    }
  }

  private onMoveStage() {
    Drag.onStart(() => StageCursor.unlock().setCursor('grab').lock())
      .onMove(({ delta }) => {
        const offset = XY.from(StageViewport.offset)
        StageViewport.offset = offset.plus(delta)
      })
      .onDestroy(() => StageCursor.unlock().setCursor('hand').lock())
  }
}

export const StageMove = new StageMoveService()
