import autoBind from 'auto-bind'
import Konva from 'konva'
import { KonvaEventListener } from 'konva/lib/Node'
import { makeObservable } from 'mobx'
import { noopFunc } from '~/helper/utils'

import { EditorService } from '~/editor/editor'
import { StageService } from '../stage'
import { StageStatus } from './status'

export class StageStatusSelect {
  hoverId = ''
  private mousemoveHandler?: KonvaEventListener<Konva.Stage, MouseEvent> = noopFunc
  private marqueeSelectHandler = noopFunc
  constructor(
    private status: StageStatus,
    private stage: StageService,
    private editor: EditorService
  ) {
    autoBind(this)
    makeObservable(this, { hoverId: true })
  }
  start() {
    this.onHover()
    this.onMarqueeSelect()
  }
  end() {
    this.stage.instance.off('mousemove', this.mousemoveHandler)
    this.stage.instance.off('mousedown', this.marqueeSelectHandler)
  }
  private onHover() {
    this.mousemoveHandler = (e) => {
      this.hoverId = e.target.id()
    }
    this.stage.instance.on('mousemove', this.mousemoveHandler)
  }
  private onMarqueeSelect() {
    this.marqueeSelectHandler = () => {
      if (this.hoverId) return
      let marquee: Konva.Shape
      this.editor.drag
        .onStart(({ absoluteStart }) => {
          marquee = new Konva.Rect({
            x: absoluteStart.x,
            y: absoluteStart.y,
            width: 0,
            height: 0,
            stroke: '#57ADFB',
            strokeWidth: 1,
          })
          marquee.fill('transparent')
          this.stage.mainLayer.add(marquee)
        })
        .onMove(({ absoluteMarquee: { x, y, width, height } }) => {
          marquee.x(x)
          marquee.y(y)
          marquee.width(width)
          marquee.height(height)
        })
        .onEnd(({ drag }) => {
          marquee.remove()
          drag.destroy()
        })
    }
    this.stage.instance.on('mousedown', this.marqueeSelectHandler)
  }
}
