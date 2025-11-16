import autobind from 'class-autobind-decorator'
import { Surface } from 'src/editor/render/surface'
import { StageCursor } from 'src/editor/stage/cursor'
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
        StageViewport.sceneMatrix = StageViewport.sceneMatrix
          .clone()
          .translate(delta.x, delta.y)
      })
      .onDestroy(() => StageCursor.unlock().setCursor('hand').lock())
  }
}

export const StageMove = new StageMoveService()
