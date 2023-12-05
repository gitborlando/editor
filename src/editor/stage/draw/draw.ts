import { inject, injectable } from 'tsyringe'
import { min } from '~/editor/math/base'
import { XY } from '~/editor/math/xy'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { IFrame, ILine, INode, IRect, ITriangle, IVector } from '~/editor/schema/type'
import { autobind } from '~/editor/utility/decorator'
import { cullNegatives } from '~/editor/utility/utils'
import { StageElementService, injectStageElement } from '../element'
import { PIXI, PixiService, injectPixi } from '../pixi'
import { StageCTXService, injectStageCTX } from './ctx/ctx'
import { customPixiCTX } from './ctx/pixi-ctx'
import { Path } from './path/path'
import { PathPoint } from './path/point'

type IStageElement = PIXI.Graphics | PIXI.Text

@autobind
@injectable()
export class StageDrawService {
  private element!: IStageElement
  constructor(
    @injectPixi private pixiService: PixiService,
    @injectStageCTX private stageCTXService: StageCTXService,
    @injectStageElement private stageElementService: StageElementService,
    @injectSchemaNode private schemaNodeService: SchemaNodeService
  ) {}
  draw(node: INode) {
    if (node.type === 'frame') this.drawFrame(node)
    if (node.type === 'vector') {
      if (node.vectorType === 'rect') this.drawRect(node)
      if (node.vectorType === 'triangle') this.drawTriangle(node)
      if (node.vectorType === 'line') this.drawLine(node)
    }
    this.setupElement(this.element, node.id, node.parentId)
  }
  private drawFrame(node: IFrame) {
    const { x, y, width, height, id, fill } = node
    const shape = this.findShapeOrCreate(id, 'graphic')
    shape.clear()
    this.drawFill(shape, fill)
    shape.drawRect(x, y, width, height)
  }
  private drawRect(node: IRect) {
    const { x, y, width, height, id, fill, points } = node
    const shape = this.findShapeOrCreate(id, 'graphic')
    shape.clear()
    this.drawFill(shape, fill)
    shape.lineStyle(1, 'green')
    this.drawPath(shape, node)
  }
  private drawTriangle(node: ITriangle) {
    const { x, y, width, height, id, fill, points } = node
    const shape = this.findShapeOrCreate(id, 'graphic')
    shape.clear()
    this.drawFill(shape, fill)
    shape.lineStyle(1, 'green')
    this.drawPath(shape, node)
  }
  private drawLine(node: ILine) {
    const { id, fill, start, end, points } = node
    const shape = this.findShapeOrCreate(id, 'graphic')
    shape.clear()
    this.drawFill(shape, fill)
    shape.lineStyle(1, 'red')
    // shape.moveTo(start.x, start.y)
    // shape.lineTo(end.x, end.y)
    this.drawPath(shape, node)
    //console.log(shape.geometry.points)
    shape.hitArea = {
      contains: (x: number, y: number) => {
        const points = shape.geometry.points
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
  private drawPath(shape: PIXI.Graphics, vector: IVector) {
    customPixiCTX(this.stageCTXService, shape)
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
        this.stageCTXService.moveTo(startXY)
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
          this.stageCTXService.arcTo(startPoint, startPoint.right!, radius)
          hasArcedPointMap.add(startPoint)
        }
        if (!endPoint.canDrawArc) {
          return this.stageCTXService.lineTo(endPoint)
        }
        if (endPoint.canDrawArc && !hasArcedPointMap.has(endPoint)) {
          const leftMaxRadius =
            endPoint.left!.arcLength &&
            endPoint.calcRadiusByArcLength(endPoint.leftLine!.length - endPoint.left!.arcLength!)
          const rightMaxRadius =
            endPoint.right!.arcLength &&
            endPoint.calcRadiusByArcLength(endPoint.rightLine!.length - endPoint.right!.arcLength)
          const radius = min(...cullNegatives(endPoint.radius, rightMaxRadius, leftMaxRadius))
          this.stageCTXService.arcTo(endPoint, endPoint.right!, radius)
          hasArcedPointMap.add(endPoint)
        }
        if (at.end && !startPoint.jumpToRight) this.stageCTXService.closePath()
      }

      if (curLine.type === 'curve') {
      }
    })
  }
  private drawFill(shape: PIXI.Graphics, fill: INode['fill']) {
    shape.beginFill(fill)
  }
  private findShapeOrCreate(id: string, type: 'graphic'): PIXI.Graphics
  private findShapeOrCreate(id: string, type: 'text'): PIXI.Text
  private findShapeOrCreate(id: string, type: 'graphic' | 'text') {
    if (type === 'text') {
      return (this.element = (this.stageElementService.find(id) as PIXI.Text) || new PIXI.Text())
    } else {
      return (this.element =
        (this.stageElementService.find(id) as PIXI.Graphics) || new PIXI.Graphics())
    }
  }
  private setupElement(element: IStageElement, id: string, parentId: string) {
    if (!element.parent) {
      const parent = this.stageElementService.find(parentId) || this.pixiService.stage
      element.setParent(parent)
    }
    if (!this.stageElementService.find(id)) {
      this.stageElementService.add(id, element)
      element.eventMode = 'dynamic'
      element.on('mouseenter', () => this.schemaNodeService.hover(id))
      element.on('mouseleave', () => this.schemaNodeService.hover(''))
    }
  }
}

export const injectStageDraw = inject(StageDrawService)
