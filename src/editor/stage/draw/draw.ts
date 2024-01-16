import autobind from 'class-autobind-decorator'
import { radianfy } from '~/editor/math/base'
import { SchemaNode } from '~/editor/schema/node'
import { IFill, IIrregular, INode, IVector } from '~/editor/schema/type'
import { XY } from '~/shared/structure/xy'
import { createLinearGradientTexture } from '~/shared/utils/pixi/linear-gradient'
import { createRegularPolygon } from '~/shared/utils/pixi/regular-polygon'
import { createStarPolygon } from '~/shared/utils/pixi/star'
import { StageElement } from '../element'
import { PIXI } from '../pixi'
import { StageDrawPath } from './path'

type IStageElement = PIXI.Graphics | PIXI.Text

@autobind
export class StageDrawService {
  initHook() {
    SchemaNode.afterFlushDirty.hook(() => {
      SchemaNode.redrawIds.forEach((id) => {
        const node = SchemaNode.find(id)
        StageDraw.drawNode(node)
      })
      SchemaNode.redrawIds.clear()
    })
  }
  private drawNode(node: INode) {
    const { id, fills } = node
    const element = StageElement.findOrCreate(id, 'graphic')
    element.clear()
    this.drawFills(element, node, fills)
  }
  private drawFills<T extends INode = INode>(element: PIXI.Graphics, node: T, fills: IFill[]) {
    fills.forEach((fill) => {
      if (fill.type === 'color') {
        element.beginFill(fill.color)
      }
      if (fill.type === 'linearGradient') {
        const texture = StageElement.linearGradientCache.getSet(node.id, () =>
          createLinearGradientTexture(fill)
        )
        element.beginTextureFill({ texture })
      }
      this.drawShape(element, <IVector>node)
    })
  }
  drawShape(element: PIXI.Graphics, node: INode) {
    const { width, height } = node
    const rotation = radianfy(node.rotation)
    const pivotXY = this.getElementPivotXY(node)
    element.x = pivotXY.x
    element.y = pivotXY.y
    element.rotation = rotation
    if (node.type === 'frame') {
      return element.drawRect(0, 0, width, height)
    }
    if (node.type === 'vector') {
      if (node.vectorType === 'rect') {
        element.drawRect(0, 0, width, height)
      }
      if (node.vectorType === 'ellipse') {
        element.drawEllipse(width / 2, height / 2, width / 2, height / 2)
      }
      if (node.vectorType === 'polygon') {
        const polygon = createRegularPolygon(width, height, node.sides, rotation)
        return element.drawPolygon(polygon)
      }
      if (node.vectorType === 'star') {
        const star = createStarPolygon(width, height, node.points, node.innerRate, rotation)
        return element.drawPolygon(star)
      }
      if (node.vectorType === 'line') {
        // const polygon = createRegularPolygon(width, height, node.sides, rotation)
        // return element.drawPolygon(polygon)
      }
      if (node.vectorType === 'irregular') {
        const path = StageElement.pathCache.getSet(node.id, () =>
          StageDrawPath.createPath(<IIrregular>node)
        )
        StageDrawPath.drawPath(path, element)
        return
      }
    }
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
  private getElementPivotXY(node: INode) {
    const pivotX = node.centerX - node.width / 2
    const pivotY = node.centerY - node.height / 2
    return XY.Of(pivotX, pivotY).rotate(XY.From(node, 'center'), node.rotation)
  }
}

export const StageDraw = new StageDrawService()
