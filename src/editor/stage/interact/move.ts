import autobind from 'class-autobind-decorator'
import { xy_from, xy_plus } from '~/editor/math/xy'
import { Drag } from '~/global/event/drag'
import { Pixi } from '../pixi'
import { StageViewport } from '../viewport'

@autobind
class StageMoveService {
  startInteract() {
    Pixi.addListener('mousedown', this.onMoveStage)
  }
  endInteract() {
    Pixi.removeListener('mousedown', this.onMoveStage)
  }
  private onMoveStage() {
    const start = xy_from(Pixi.sceneStage.position)
    Drag.onSlide(({ shift }) => {
      StageViewport.stageOffset.dispatch(xy_plus(start, shift))
    })
  }
}

export const StageMove = new StageMoveService()
