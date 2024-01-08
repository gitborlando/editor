import { Drag } from '~/global/drag'
import { autobind } from '~/shared/decorator'
import { XY } from '~/shared/structure/xy'
import { Pixi } from '../pixi'
import { StageViewport } from '../viewport'

@autobind
export class StageMoveService {
  startInteract() {
    Pixi.addListener('mousedown', this.onMoveStage)
  }
  endInteract() {
    Pixi.removeListener('mousedown', this.onMoveStage)
  }
  private onMoveStage() {
    const start = XY.From(Pixi.sceneStage.position)
    Drag.onSlide(({ shift }) => {
      StageViewport.stageOffset.dispatch(start.plus(shift))
    })
  }
}

export const StageMove = new StageMoveService()
