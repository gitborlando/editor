import { radianfy } from '~/editor/math/base'
import { SchemaNode } from '~/editor/schema/node'
import { IFill, IIrregular, INode, IVector } from '~/editor/schema/type'
import { autobind } from '~/shared/decorator'
import { createLinearGradientTexture } from '~/shared/utils/pixi/linear-gradient'
import { StageElement } from '../element'
import { PIXI } from '../pixi'
import { StageDrawPath } from './path'
import { drawRegularPolygon } from './pixi/regular-polygon'

type IStageElement = PIXI.Graphics | PIXI.Text

@autobind
export class StageDrawService {
  currentElement!: IStageElement
  drawNode(node: INode) {
    const { id, fills } = node
    const element = StageElement.findOrCreate(id, 'graphic')
    element.clear()
    this.drawFills(element, node, fills)
  }
  drawFills<T extends INode = INode>(element: PIXI.Graphics, node: T, fills: IFill[]) {
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
    const { id, parentId, x, y, width, height, rotation } = node
    const parentNode = SchemaNode.find(parentId)
    element.x = x /*  - (parentNode?.x || 0) */
    element.y = y /* - (parentNode?.y || 0) */
    element.rotation = radianfy(rotation /* - (parentNode?.rotation || 0) */)
    // this.drawHitArea(element)
    if (node.type === 'frame') {
      return element.drawRect(0, 0, width, height)
    }
    if (node.type === 'vector') {
      if (node.vectorType === 'rect') {
        element.drawRect(0, 0, width, height)
      }
      if (node.vectorType === 'triangle') {
        return drawRegularPolygon(element, width / 2, height / 2, width / 2, node.sides, rotation)
      }
      if (node.vectorType === 'star') {
        return drawRegularPolygon(element, width / 2, height / 2, width / 2, node.sides, rotation)
      }
      if (node.vectorType === 'line') {
        return drawRegularPolygon(element, width / 2, height / 2, width / 2, rotation)
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
      console.log([...odds, ...evens.reverse()])
      return new PIXI.Polygon([...odds, ...evens.reverse()]).contains(x, y)
    }
    element.hitArea = { contains }
  }
}

export const StageDraw = new StageDrawService()
