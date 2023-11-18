import Konva from 'konva'
import { Shape, ShapeConfig } from 'konva/lib/Shape'
import { makeObservable } from 'mobx'
import { radianfy } from '~/editor/utils'
import { EditorService } from '../../editor'
import { StageService } from '../stage'
import { drawEllipsePath } from './ellipse'

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
      sceneFunc: (ctx, shape) => {
        const { x, y, width, height, rotation } = this.getShapeBaseAttr(shape)
        const innerRate = (shape.getAttr('innerRate') || 0) as number
        const startRadian = radianfy((shape.getAttr('startAngle') || 0) as number)
        const endRadian = radianfy((shape.getAttr('endAngle') || 360) as number)
        const center = { x: x + width / 2, y: y + height / 2 }
        const radius = { x: width / 2, y: height / 2 }
        const path = drawEllipsePath(center, radius, rotation, startRadian, endRadian, innerRate)
        const fill = shape.getAttr('fill')
        ctx.fillStyle = fill
        ctx.fill(path)
      },
    })
    this.stage.mainLayer.add(item)
    return item
  }
  private getShapeBaseAttr(shape: Shape<ShapeConfig>) {
    const x = (shape.getAttr('x') || 0) as number
    const y = (shape.getAttr('y') || 0) as number
    const width = (shape.getAttr('width') || 0) as number
    const height = (shape.getAttr('height') || 0) as number
    const rotation = (shape.getAttr('rotation') || 0) as number
    return { x, y, width, height, rotation }
  }
}
