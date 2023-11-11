import Konva from 'konva'
import { KonvaEventListener } from 'konva/lib/Node'
import { noopFunc } from '~/helper/utils'
import { EditorService } from '~/service/editor/editor'
import { StageService } from '../stage'
import { StageStatus } from './status'

export class StageStatusSelect {
  private isOnLayer: boolean = false
  hoverId = ''
  private select = noopFunc
  private mousedown?: KonvaEventListener<Konva.Stage, MouseEvent> = noopFunc
  private mousemove?: KonvaEventListener<Konva.Stage, MouseEvent> = noopFunc
  constructor(
    private status: StageStatus,
    private stage: StageService,
    private editor: EditorService
  ) {}
  start() {
    this.mousemove = (e) => {
      this.hoverId = e.target.id()
    }
    this.stage.instance.on('mousemove', this.mousemove)
    this.mousedown = (e) => {
      this.hoverId = e.target.id()
      this.isOnLayer = true
    }
    this.stage.instance.on('mousedown', this.mousedown)

    this.select = () => {
      if (this.hoverId) this.editor.drag.destroy()
      console.log('select', this.hoverId)
      let item: Konva.Shape
      this.editor.drag
        .onStart(({ absoluteStart }) => {
          item = new Konva.Rect({
            x: absoluteStart.x,
            y: absoluteStart.y,
            width: 0,
            height: 0,
            stroke: '#57ADFB',
            strokeWidth: 1,
          })
          item.fill('transparent')
          this.stage.mainLayer.add(item)
        })
        .onMove(({ absoluteMarquee: { x, y, width, height } }) => {
          item.x(x)
          item.y(y)
          item.width(width)
          item.height(height)
        })
        .onEnd(() => item.remove())
    }
    this.stage.instance.on('mousedown', this.select)
  }
  end() {
    this.editor.drag.destroy()
    this.stage.instance.off('mousemove', this.mousemove)
    this.stage.instance.off('mousedown', this.mousedown)
    this.stage.instance.off('mousedown', this.select)
  }
}
