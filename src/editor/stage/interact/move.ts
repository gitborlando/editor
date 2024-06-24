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
    StageCursor.setCursor('hand').lock()
  }

  endInteract() {
    Surface.removeEvent('mousedown', this.onMoveStage)
    StageCursor.unlock().setCursor('select', 0)
  }

  private onMoveStage() {
    const start = xy_from(StageViewport.offset$.value)
    Drag.onDown(() => {
      StageCursor.unlock().setCursor('grab').lock()
    })
      .onMove(({ shift }) => {
        StageViewport.offset$.dispatch(xy_plus(start, shift))
        StageViewport.movingStage$.dispatch(xy_plus(start, shift))
      })
      .onDestroy(() => {
        StageCursor.unlock().setCursor('hand').lock()
      })
  }
}

export const StageMove = new StageMoveService()
