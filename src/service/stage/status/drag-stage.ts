import { EditorService } from '~/service/editor/editor'
import { StageService } from '../stage'

export class StageStatusDragStage {
  private startHandler = () => {}
  constructor(private stage: StageService, private editor: EditorService) {}
  start() {
    this.startHandler = () => {
      let absoluteShift = { x: 0, y: 0 }
      let startXY = { x: this.stage.instance.x(), y: this.stage.instance.y() }
      this.editor.Drag.onStart()
        .onMove(({ shift }) => {
          absoluteShift = this.stage.absoluteShift(shift)
          this.stage.instance.x(startXY.x + absoluteShift.x)
          this.stage.instance.y(startXY.y + absoluteShift.y)
        })
        .onEnd(({ drag }) => {
          this.stage.offset.x += absoluteShift.x
          this.stage.offset.y += absoluteShift.y
          drag.destroy()
        })
    }
    this.stage.instance.on('mousedown', this.startHandler)
  }
  end() {
    this.stage.instance.off('mousedown', this.startHandler)
  }
}
