import autobind from 'class-autobind-decorator'
import { Matrix, Text, Texture } from 'pixi.js'
import { IImage, Img } from '~/editor/img'
import { radianfy } from '~/editor/math/base'
import { SchemaNode } from '~/editor/schema/node'
import { IFrame, IIrregular, INode, IVector } from '~/editor/schema/type'
import { XY } from '~/shared/structure/xy'
import { createLinearGradientTexture } from '~/shared/utils/pixi/linear-gradient'
import { createRegularPolygon } from '~/shared/utils/pixi/regular-polygon'
import { createStarPolygon } from '~/shared/utils/pixi/star'
import { StageElement } from '../element'
import { PIXI, Pixi } from '../pixi'
import { StageViewport } from '../viewport'
import { StageDrawPath } from './path'

@autobind
export class StageDrawService {
  private redrawIds = new Set<string>()
  initHook() {
    SchemaNode.afterFlushDirty.hook(() => {
      this.redrawIds.forEach((id) => this.drawNode(SchemaNode.find(id)))
      this.redrawIds.clear()
    })
  }
  collectRedraw(id: string) {
    this.redrawIds.add(id)
  }
  private drawNode(node: INode) {
    const element = StageElement.findOrCreate(node)
    element.clear()
    this.drawFills(element, node)
    this.drawStrokes(element, node)
  }
  private drawFills<T extends INode = INode>(element: PIXI.Graphics, node: T) {
    node.fills.forEach((fill) => {
      if (!fill.visible) return
      if (fill.type === 'color') {
        element.beginFill(fill.color)
        this.drawShape(element, <IVector>node)
      }
      if (fill.type === 'image') {
        const image = Img.getImage(fill.url)
        const draw = (image: IImage) => {
          const nodeRate = node.width / node.height
          const imageRate = image.width / image.height
          const texture = Texture.from(image.objectUrl)
          const matrix = new Matrix()
          if (nodeRate > imageRate) {
            matrix.scale(node.width / image.width, node.width / image.width)
          } else {
            matrix.scale(node.height / image.height, node.height / image.height)
          }
          element.beginTextureFill({ texture, matrix })
          this.drawShape(element, <IVector>node)
        }
        image ? draw(image) : Img.getImageAsync(fill.url).then(draw)
      }
      if (fill.type === 'linearGradient') {
        const texture = StageElement.linearGradientCache.getSet(node.id, () =>
          createLinearGradientTexture(fill)
        )
        element.beginTextureFill({ texture })
        this.drawShape(element, <IVector>node)
      }
    })
  }
  drawStrokes(element: PIXI.Graphics, node: INode) {
    node.strokes.forEach((stroke) => {
      const { fill, width } = stroke
      if (fill.type === 'color') {
        element.lineStyle(width, fill.color)
        this.drawShape(element, <IVector>node)
      }
      if (fill.type === 'image') {
        const image = Img.getImage(fill.url)
        const draw = (objectUrl: string) => {
          const texture = PIXI.Texture.from(objectUrl)
          element.lineTextureStyle({ width, texture })
          this.drawShape(element, <IVector>node)
        }
        if (image) {
          draw(image.objectUrl)
        } else {
          Img.getImageAsync(fill.url).then(({ objectUrl }) => draw(objectUrl))
        }
      }
      if (fill.type === 'linearGradient') {
        const texture = StageElement.linearGradientCache.getSet(node.id, () =>
          createLinearGradientTexture(fill)
        )
        element.lineTextureStyle({ width, texture })
        this.drawShape(element, <IVector>node)
      }
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
      this.drawFrameName(node)
      // const mask = new PIXI.Graphics()
      // mask.drawRect(0, 0, width, height)
      // element.mask = mask
      return element.drawRect(0, 0, width, height)
    }
    if (node.type === 'vector') {
      if (node.vectorType === 'rect') {
        element.drawRoundedRect(0, 0, width, height, node.radius)
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
    if (node.rotation === 0) return XY.Of(pivotX, pivotY)
    return XY.Of(pivotX, pivotY).rotate(XY.From(node, 'center'), node.rotation)
  }
  private drawFrameName(frame: IFrame) {
    const name = StageElement.frameNameCache.getSet(frame.id, () => {
      const nameText = new Text(frame.name, {
        fontSize: 12 / StageViewport.zoom.value,
        fill: '#9F9F9F',
      })
      nameText.setParent(Pixi.sceneStage)
      StageViewport.zoom.hook((zoom) => {
        nameText.scale.set(1 / zoom, 1 / zoom)
        this.drawFrameName(frame)
      })
      SchemaNode.afterReName.hook(({ id, name }) => {
        if (id === frame.id) nameText.text = name
      })
      return nameText
    })
    const pivotX = frame.centerX - frame.width / 2
    const pivotY = frame.centerY - frame.height / 2 - 15 / StageViewport.zoom.value
    const { x, y } = XY.Of(pivotX, pivotY).rotate(XY.From(frame, 'center'), frame.rotation)
    name.x = x
    name.y = y
    name.rotation = radianfy(frame.rotation)
  }
}

export const StageDraw = new StageDrawService()
