import { inject, injectable } from 'tsyringe'
import { min } from '~/editor/math/base'
import { XY } from '~/editor/math/xy'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { IFrame, ILine, INode, IRect, ITriangle, IVector } from '~/editor/schema/type'
import { autobind } from '~/editor/utility/decorator'
import { cullNegatives } from '~/editor/utility/utils'
import { StageElementService, injectStageElement } from '../element'
import { PIXI } from '../pixi'
import { StageCTXService, injectStageCTX } from './ctx/ctx'
import { customPixiCTX } from './ctx/pixi-ctx'
import { Path } from './path/path'
import { PathPoint } from './path/point'

type IStageElement = PIXI.Graphics | PIXI.Text

@autobind
@injectable()
export class StageDrawService {
  currentElement!: IStageElement
  constructor(
    @injectStageCTX private StageCtx: StageCTXService,
    @injectStageElement private StageElement: StageElementService,
    @injectSchemaNode private SchemaNode: SchemaNodeService
  ) {}
  drawNode(node: INode) {
    if (node.type === 'frame') this.drawFrame(node)
    if (node.type === 'vector') {
      if (node.vectorType === 'rect') this.drawRect(node)
      if (node.vectorType === 'triangle') this.drawTriangle(node)
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
    const { x, y, width, height, id, fill, points } = node
    const nodeRuntime = this.SchemaNode.findNodeRuntime(id)
    const element = this.findElementOrCreate(id, 'graphic')
    element.clear()
    this.drawFill(element, fill)
    element.lineStyle(1, 'green')
    this.SchemaNode.hoverId === id && element.lineStyle(2, 'blue')
    this.SchemaNode.selectIds.has(id) && element.lineStyle(2, 'red')
    this.drawPath(element, node)
  }
  private drawTriangle(node: ITriangle) {
    const { x, y, width, height, id, fill, points } = node
    const element = this.findElementOrCreate(id, 'graphic')
    element.clear()
    this.drawFill(element, fill)
    element.lineStyle(1, 'green')
    this.SchemaNode.hoverId === id && element.lineStyle(2, 'blue')
    this.SchemaNode.selectIds.has(id) && element.lineStyle(2, 'red')
    this.drawPath(element, node)
  }
  private drawLine(node: ILine) {
    const { id, fill, start, end, points } = node
    const element = this.findElementOrCreate(id, 'graphic')
    element.clear()
    // this.drawFill(element, fill)
    element.lineStyle(1, 'red')
    element.moveTo(start.x, start.y)
    // shape.lineTo(end.x, end.y)
    element.quadraticCurveTo(start.x + 200, start.y, end.x, end.y)
    //  this.drawPath(element, node)
    this.SchemaNode.hoverId === id && element.lineStyle(2, 'blue')
    this.SchemaNode.selectIds.has(id) && element.lineStyle(2, 'red')
    element.hitArea = {
      contains: (x: number, y: number) => {
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
      },
    }
  }
  private drawPath(element: PIXI.Graphics, vector: IVector) {
    customPixiCTX(this.StageCtx, element)
    const pathPoints = vector.points.map((nodePoint) => {
      return new PathPoint({
        ...nodePoint,
        x: nodePoint.x + vector.x,
        y: nodePoint.y + vector.y,
      })
    })
    const path = new Path(pathPoints)

    const hasArcedPointMap = new Set<PathPoint>()
    path.forEachLine(({ cur: curLine, at }) => {
      const { start: startPoint, end: endPoint } = curLine
      if (at.first) {
        const startXY = new XY(0, 0)
        if (startPoint.canDrawArc) {
          startXY.set(startPoint.leftLine!.calcXYInSomeDistance(startPoint.arcLength!)!)
        } else {
          startXY.set(startPoint)
        }
        this.StageCtx.moveTo(startXY)
      }

      if (curLine.type === 'line') {
        if (startPoint.canDrawArc && !hasArcedPointMap.has(startPoint)) {
          const leftMaxRadius =
            startPoint.left!.arcLength &&
            startPoint.calcRadiusByArcLength(
              startPoint.leftLine!.length - startPoint.left!.arcLength!
            )
          const rightMaxRadius =
            startPoint.right!.arcLength &&
            startPoint.calcRadiusByArcLength(
              startPoint.rightLine!.length - startPoint.right!.arcLength
            )
          const radius = min(...cullNegatives(startPoint.radius, rightMaxRadius, leftMaxRadius))
          // console.log([startPoint.radius, rightMaxRadius, leftMaxRadius])
          this.StageCtx.arcTo(startPoint, startPoint.right!, radius)
          hasArcedPointMap.add(startPoint)
        }
        if (!endPoint.canDrawArc) {
          return this.StageCtx.lineTo(endPoint)
        }
        if (endPoint.canDrawArc && !hasArcedPointMap.has(endPoint)) {
          const leftMaxRadius =
            endPoint.left!.arcLength &&
            endPoint.calcRadiusByArcLength(endPoint.leftLine!.length - endPoint.left!.arcLength!)
          const rightMaxRadius =
            endPoint.right!.arcLength &&
            endPoint.calcRadiusByArcLength(endPoint.rightLine!.length - endPoint.right!.arcLength)
          const radius = min(...cullNegatives(endPoint.radius, rightMaxRadius, leftMaxRadius))
          this.StageCtx.arcTo(endPoint, endPoint.right!, radius)
          hasArcedPointMap.add(endPoint)
        }
        if (at.end && !startPoint.jumpToRight) this.StageCtx.closePath()
      }

      if (curLine.type === 'curve') {
      }
    })
  }
  private drawFill(shape: PIXI.Graphics, fill: INode['fill']) {
    shape.beginFill(fill)
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
