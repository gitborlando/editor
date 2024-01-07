import { inject, injectable } from 'tsyringe'
import { radianfy } from '~/editor/math/base'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { IFill, IIrregular, INode, IVector } from '~/editor/schema/type'
import { SchemaUtilService, injectSchemaUtil } from '~/editor/schema/util'
import { autobind } from '~/shared/decorator'
import { createLinearGradientTexture } from '~/shared/utils/pixi/linear-gradient'
import { StageElementService, injectStageElement } from '../element'
import { PIXI } from '../pixi'
import { StageViewportService, injectStageViewport } from '../viewport'
import { StageDrawPathService, injectStageDrawPath } from './path'
import { drawRegularPolygon } from './pixi/regular-polygon'

type IStageElement = PIXI.Graphics | PIXI.Text

@autobind
@injectable()
export class StageDrawService {
  currentElement!: IStageElement
  constructor(
    @injectStageElement private StageElement: StageElementService,
    @injectStageDrawPath private StageDrawPath: StageDrawPathService,
    @injectStageViewport private StageViewport: StageViewportService,
    @injectSchemaUtil private SchemaUtil: SchemaUtilService,
    @injectSchemaNode private SchemaNode: SchemaNodeService
  ) {}
  drawNode(node: INode) {
    const { id, fills } = node
    const element = this.StageElement.findOrCreate(id, 'graphic')
    element.clear()
    this.drawFills(element, node, fills)
  }
  drawFills<T extends INode = INode>(element: PIXI.Graphics, node: T, fills: IFill[]) {
    fills.forEach((fill) => {
      if (fill.type === 'color') {
        element.beginFill(fill.color)
      }
      if (fill.type === 'linearGradient') {
        const texture = this.StageElement.linearGradientCache.getSet(node.id, () =>
          createLinearGradientTexture(fill)
        )
        element.beginTextureFill({ texture })
      }
      this.drawShape(element, <IVector>node)
    })
  }
  drawShape(element: PIXI.Graphics, node: INode) {
    const { id, parentId, x, y, width, height, rotation } = node
    const parentNode = this.SchemaNode.find(parentId)
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
        const path = this.StageElement.pathCache.getSet(node.id, () =>
          this.StageDrawPath.createPath(<IIrregular>node)
        )
        this.StageDrawPath.drawPath(path, element)
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

export const injectStageDraw = inject(StageDrawService)
