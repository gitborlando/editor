import Konva from 'konva'
import { makeObservable } from 'mobx'
import { radianfy } from '~/helper/utils'
import { EditorService } from '../../editor/editor'
import { StageService } from '../stage'
import { drawEllipse } from './ellipse/ellipse'

type IDrawType = 'rect' | 'ellipse' | 'polygon' | 'line' | 'text'

export class StageDraw {
  type: IDrawType = 'rect'
  constructor(private stage: StageService, private editor: EditorService) {
    makeObservable(this, {
      type: true,
    })
  }
  setType(type: IDrawType) {
    this.type = type
    return this
  }
  clearAll() {
    this.stage.mainLayer.destroyChildren()
    //this.stage.transformer.hide()
  }
  rect() {
    const item = new Konva.Rect()
    this.stage.mainLayer.add(item)
    return item
  }
  ellipse() {
    const item = new Konva.Shape({
      sceneFunc(ctx, shape) {
        console.log(shape.getAttr('width'))
        const x = (shape.getAttr('x') || 0) as number
        const y = (shape.getAttr('y') || 0) as number
        const width = (shape.getAttr('width') || 0) as number
        const height = (shape.getAttr('height') || 0) as number
        const rotation = (shape.getAttr('rotation') || 0) as number
        const innerRate = (shape.getAttr('innerRate') || 0) as number
        const startRadian = radianfy((shape.getAttr('startAngle') || 0) as number)
        const endRadian = radianfy((shape.getAttr('endAngle') || 360) as number)
        const center = { x: x + width / 2, y: y + height / 2 }
        const radius = { x: width / 2, y: height / 2 }
        drawEllipse(ctx, center, radius, rotation, startRadian, endRadian, innerRate)
        ctx.fillStrokeShape(shape)
      },
    })
    this.stage.mainLayer.add(item)
    return item
  }
}
