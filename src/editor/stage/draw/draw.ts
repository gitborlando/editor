import { inject, injectable } from 'tsyringe'
import { IFrame, ILine, INode, IRect, IStar, ITriangle, IVector } from '~/editor/schema/type'
import { autobind } from '~/shared/decorator'
import { StageElementService, injectStageElement } from '../element'
import { PIXI } from '../pixi'
import { StageDrawPathService, injectStageDrawPath } from './path'

type IStageElement = PIXI.Graphics | PIXI.Text

@autobind
@injectable()
export class StageDrawService {
  currentElement!: IStageElement
  constructor(
    @injectStageElement private StageElement: StageElementService,
    @injectStageDrawPath private StageDrawPath: StageDrawPathService
  ) {}
  drawNode(node: INode) {
    if (node.type === 'frame') this.drawFrame(node)
    if (node.type === 'vector') {
      if (node.vectorType === 'rect') this.drawRect(node)
      if (node.vectorType === 'triangle') this.drawTriangle(node)
      if (node.vectorType === 'star') this.drawStar(node)
      if (node.vectorType === 'line') this.drawLine(node)
    }
  }
  private drawFrame(node: IFrame) {
    const { x, y, width, height, id, fill } = node
    const element = this.findElementOrCreate(id, 'graphic')
    element.clear()
    this.drawFill(element, fill)
    element.drawRect(x, y, width, height)
  }
  private drawRect(node: IRect) {
    const { /* x, y, width, height, */ id, fill, points, rotation } = node
    const element = this.findElementOrCreate(id, 'graphic')
    element.clear()
    this.drawFill(element, fill)
    this.drawPath(element, node)
  }
  private drawTriangle(node: ITriangle) {
    const { x, y, width, height, id, fill, points } = node
    const element = this.findElementOrCreate(id, 'graphic')
    element.clear()
    this.drawFill(element, fill)
    // element.lineStyle(1, 'green')
    this.drawPath(element, node)
  }
  private drawStar(node: IStar) {
    const { x, y, width, height, id, fill, points } = node
    const element = this.findElementOrCreate(id, 'graphic')
    element.clear()
    this.drawFill(element, fill)
    //element.lineStyle(1, 'green')
    this.drawPath(element, node)
    //this.drawHitArea(element)
  }
  private drawLine(node: ILine) {
    const { id, fill, start, end, points } = node
    const element = this.findElementOrCreate(id, 'graphic')
    element.clear()
    this.drawFill(element, fill)
    element.lineStyle(1, 'black')
    this.drawPath(element, node)
    this.drawHitArea(element)
  }
  private drawFill(shape: PIXI.Graphics, fill: INode['fill']) {
    shape.beginFill(fill)
  }
  private drawPath(element: PIXI.Graphics, node: IVector) {
    const path = this.StageDrawPath.patchPath(node)
    this.StageDrawPath.drawPath(path, element)
  }
  private drawHitArea(element: PIXI.Graphics) {
    const contains = (x: number, y: number) => {
      const points = element.geometry.points
      const odds: { x: number; y: number; z: number }[] = []
      const evens: { x: number; y: number; z: number }[] = []
      for (let index = 0; index * 2 < points.length; index++) {
        const x = points[index * 2]
        const y = points[index * 2 + 1]
        const z = points[index * 2 + 2]
        if (index % 2 === 0) {
          odds.push({ x, y, z })
        } else {
          evens.push({ x, y, z })
        }
      }
      return new PIXI.Polygon([...odds, ...evens.reverse()]).contains(x, y)
    }
    element.hitArea = { contains }
  }
  private findElementOrCreate(id: string, type: 'graphic'): PIXI.Graphics
  private findElementOrCreate(id: string, type: 'text'): PIXI.Text
  private findElementOrCreate(id: string, type: 'graphic' | 'text') {
    if (type === 'text') {
      return (this.currentElement = (this.StageElement.find(id) as PIXI.Text) || new PIXI.Text())
    } else {
      return (this.currentElement =
        (this.StageElement.find(id) as PIXI.Graphics) || new PIXI.Graphics())
    }
  }
}

export const injectStageDraw = inject(StageDrawService)
