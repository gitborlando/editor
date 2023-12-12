import { inject, injectable } from 'tsyringe'
import { min } from '~/editor/math/base'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { IFrame, ILine, INode, IRect, IStar, ITriangle, IVector } from '~/editor/schema/type'
import { SettingService, injectSetting } from '~/global/setting'
import { autobind } from '~/shared/decorator'
import { macroStringMatch } from '~/shared/macro/string-match'
import { MultiCache } from '~/shared/multi-cache'
import { XY } from '~/shared/structure/xy'
import { cullNegatives } from '~/shared/utils'
import { StageElementService, injectStageElement } from '../element'
import { PIXI } from '../pixi'
import { StageViewportService, injectStageViewport } from '../viewport'
import { Path } from './path/path'
import { PathPoint } from './path/point'

type IStageElement = PIXI.Graphics | PIXI.Text

@autobind
@injectable()
export class StageDrawService {
  currentElement!: IStageElement
  constructor(
    @injectStageElement private StageElement: StageElementService,
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectStageViewport private StageViewport: StageViewportService,
    @injectSetting private Setting: SettingService
  ) {}
  drawNode(node: INode) {
    if (macroStringMatch`transform|marquee`(node.id)) return
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
    const { x, y, width, height, id, fill, points } = node
    const element = this.findElementOrCreate(id, 'graphic')
    element.clear()
    this.SchemaNode.selectIds.has(id) &&
      element.lineStyle(1 / this.StageViewport.zoom, this.Setting.color)
    this.drawFill(element, fill)
    this.drawPath(element, node)
  }
  private drawTriangle(node: ITriangle) {
    const { x, y, width, height, id, fill, points } = node
    const element = this.findElementOrCreate(id, 'graphic')
    element.clear()
    this.drawFill(element, fill)
    // element.lineStyle(1, 'green')
    this.SchemaNode.selectIds.has(id) &&
      element.lineStyle(1 / this.StageViewport.zoom, this.Setting.color)
    this.drawPath(element, node)
  }
  private drawStar(node: IStar) {
    const { x, y, width, height, id, fill, points } = node
    const element = this.findElementOrCreate(id, 'graphic')
    element.clear()
    this.drawFill(element, fill)
    //element.lineStyle(1, 'green')
    this.SchemaNode.selectIds.has(id) &&
      element.lineStyle(1 / this.StageViewport.zoom, this.Setting.color)
    this.drawPath(element, node)
    //this.drawHitArea(element)
  }
  private drawLine(node: ILine) {
    const { id, fill, start, end, points } = node
    const element = this.findElementOrCreate(id, 'graphic')
    element.clear()
    this.drawFill(element, fill)
    element.lineStyle(1, 'black')
    this.SchemaNode.selectIds.has(id) &&
      element.lineStyle(1 / this.StageViewport.zoom, this.Setting.color)
    this.drawPath(element, node)
    this.drawHitArea(element)
  }
  private drawFill(shape: PIXI.Graphics, fill: INode['fill']) {
    shape.beginFill(fill)
  }
  drawPath(element: PIXI.Graphics, node: IVector) {
    const createPath = () => {
      const pathPoints = node.points.map((nodePoint) => {
        const rotatedXY = XY.From(nodePoint).rotate(XY.Of(0, 0), node.rotation)
        const rotatedHandleLeft =
          nodePoint.handleLeft && XY.From(nodePoint.handleLeft).rotate(XY.Of(0, 0), node.rotation)
        const rotatedHandleRight =
          nodePoint.handleRight && XY.From(nodePoint.handleRight).rotate(XY.Of(0, 0), node.rotation)
        const centerXY = XY.Of(node.centerX, node.centerY)
        return new PathPoint({
          ...nodePoint,
          ...rotatedXY.plus(centerXY),
          ...(rotatedHandleLeft && { handleLeft: rotatedHandleLeft.plus(centerXY) }),
          ...(rotatedHandleRight && { handleRight: rotatedHandleRight.plus(centerXY) }),
        })
      })
      return new Path(pathPoints)
    }

    const cache = MultiCache.GetOrNew('draw-path')
    const { geometryChanged } = this.SchemaNode.findNodeRuntime(node.id)

    let path: Path
    if (geometryChanged) {
      path = cache.set(node.id, createPath())
    } else {
      path = cache.getSet(node.id, () => createPath())
    }

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
        element.moveTo(startXY.x, startXY.y)
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
          element.arcTo(
            startPoint.x,
            startPoint.y,
            startPoint.right!.x,
            startPoint.right!.y,
            radius
          )
          hasArcedPointMap.add(startPoint)
        }
        if (!endPoint.canDrawArc) {
          return element.lineTo(endPoint.x, endPoint.y)
        }
        if (endPoint.canDrawArc && !hasArcedPointMap.has(endPoint)) {
          const leftMaxRadius =
            endPoint.left!.arcLength &&
            endPoint.calcRadiusByArcLength(endPoint.leftLine!.length - endPoint.left!.arcLength!)
          const rightMaxRadius =
            endPoint.right!.arcLength &&
            endPoint.calcRadiusByArcLength(endPoint.rightLine!.length - endPoint.right!.arcLength)
          const radius = min(...cullNegatives(endPoint.radius, rightMaxRadius, leftMaxRadius))
          element.arcTo(endPoint.x, endPoint.y, endPoint.right!.x, endPoint.right!.y, radius)
          hasArcedPointMap.add(endPoint)
        }
        if (at.end && !startPoint.jumpToRight) element.closePath()
      }

      if (curLine.type === 'curve') {
        const { start, end } = curLine
        const handleRight = start.handleRight || start
        const handleLeft = end.handleLeft || end
        element.bezierCurveTo(
          handleRight.x,
          handleRight.y,
          handleLeft.x,
          handleLeft.y,
          end.x,
          end.y
        )
      }
    })
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
