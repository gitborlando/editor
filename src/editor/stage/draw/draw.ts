import { DropShadowFilter } from '@pixi/filter-drop-shadow'
import autobind from 'class-autobind-decorator'
import { Graphics, Matrix, Text, Texture } from 'pixi.js'
import rgbHex from 'rgb-hex'
import { IImage, Img } from 'src/editor/editor/img'
import { pointsOnBezierCurves } from 'src/editor/math/bezier/points-of-bezier'
import { xy_ } from 'src/editor/math/xy'
import { Schema } from 'src/editor/schema/schema'
import { ID, IFillLinearGradient, IIrregular, INode, IVector } from 'src/editor/schema/type'
import { loopFor } from 'src/shared/utils/array'
import { createCache } from 'src/shared/utils/cache'
import { rgb, rgbToRgba } from 'src/shared/utils/color'
import { IXY, iife } from 'src/shared/utils/normal'
import { pixiPolylineContainsPoint } from 'src/shared/utils/pixi/line-hit-area'
import { createLinearGradientTexture } from 'src/shared/utils/pixi/linear-gradient'
import { createRegularPolygon } from 'src/shared/utils/pixi/regular-polygon'
import { createStarPolygon } from 'src/shared/utils/pixi/star'
import { StageElement } from '../element'
import { PIXI, Pixi } from '../pixi'
import { StageViewport } from '../viewport'

export type IStageElement = PIXI.Graphics | PIXI.Text

@autobind
class StageDrawService {
  private redrawIds = new Set<ID>()
  private linearGradientCache = createCache<ID, PIXI.Texture>()
  private requested = false

  collectRedraw(id: string) {
    this.redrawIds.add(id)

    if (this.requested) return
    this.requested = true

    queueMicrotask(() => {
      this.redrawIds.forEach((id) => {
        const node = Schema.find<INode>(id)
        const element = StageElement.elements.get(id)
        this.drawNode(element, node)
      })
      Pixi.app.renderer.render(Pixi.app.stage)

      this.redrawIds.clear()
      this.requested = false
    })
  }

  drawNode(element: IStageElement, node: INode) {
    if ('clear' in element) element.clear()
    this.drawFills(element, node)
    this.drawStrokes(element, node)
    this.drawShadows(element, node)
  }

  private drawFills<T extends INode = INode>(element: IStageElement, node: T) {
    const graphic = element as PIXI.Graphics
    if (node.fills.length === 0) {
      graphic.beginFill?.(rgb(0, 0, 0), 0.0001)
      this.drawShape(element, node)
    }
    node.fills.forEach((fill) => {
      if (!fill.visible) return

      if (fill.type === 'color') {
        if (this.isText(element)) {
          element.style.fill = rgbToRgba(fill.color, fill.alpha)
        } else {
          element.beginFill(fill.color, fill.alpha)
        }
        this.drawShape(element, <IVector>node)
      }

      if (fill.type === 'image') {
        if (this.isText(element)) return
        const image = Img.getImage(fill.url)
        const draw = (image: IImage) => {
          const { texture, matrix } = this.getImageTextureMatrix(node, image)
          element.beginTextureFill({ texture, matrix, alpha: fill.alpha })
          this.drawShape(element, <IVector>node)
        }
        image ? draw(image) : Img.getImageAsync(fill.url).then(draw)
      }

      if (fill.type === 'linearGradient') {
        if (this.isText(element)) return
        const texture = this.getLinearGradientTexture(node, fill)
        element.beginTextureFill({ texture, alpha: fill.alpha })
        this.drawShape(element, <IVector>node)
      }
    })
  }

  drawStrokes(element: IStageElement, node: INode) {
    node.strokes.forEach((stroke) => {
      if (!stroke.visible) return
      const { fill, width, align, join, cap } = stroke
      const alignment = { inner: 0, center: 0.5, outer: 1 }[align]
      if (fill.type === 'color') {
        if (this.isText(element)) return
        element.lineStyle({ width, color: fill.color, alignment, alpha: fill.alpha, join, cap })
        this.drawShape(element, <IVector>node)
      }
      if (fill.type === 'image') {
        if (this.isText(element)) return
        const image = Img.getImage(fill.url)
        const draw = (image: IImage) => {
          const { texture, matrix } = this.getImageTextureMatrix(node, image)
          const option = { width, alignment, texture, matrix, alpha: fill.alpha, join, cap }
          element.lineTextureStyle(option)
          this.drawShape(element, <IVector>node)
        }
        image ? draw(image) : Img.getImageAsync(fill.url).then(draw)
      }
      if (fill.type === 'linearGradient') {
        if (this.isText(element)) return
        const texture = this.getLinearGradientTexture(node, fill)
        element.lineTextureStyle({ width, texture, alignment, alpha: fill.alpha, join, cap })
        this.drawShape(element, <IVector>node)
      }
    })
  }

  drawShadows(element: IStageElement, node: INode) {
    element.filters = []
    node.shadows.forEach((shadow) => {
      if (!shadow.visible) return
      if (this.isText(element)) return
      const { fill, offsetX, offsetY, blur } = shadow
      if (fill.type !== 'color') return
      const zoom = StageViewport.zoom.value
      const filter = new DropShadowFilter({
        offset: { x: offsetX * zoom, y: offsetY * zoom },
        color: Number(`0x${rgbHex(fill.color)}`),
        alpha: fill.alpha,
        blur: blur * zoom,
        quality: 60,
      })
      element.filters?.push(filter)
      element.filterArea = new PIXI.Rectangle(0, 0, 9999, 9999)
    })
  }

  setGeometry(element: IStageElement, node: INode) {
    element.x = node.x
    element.y = node.y
    element.angle = node.rotation
  }

  drawShape(element: IStageElement, node: INode) {
    this.setGeometry(element, node)
    const { width, height, rotation } = node
    const graphics = element as Graphics
    if (node.type === 'frame') {
      graphics.drawRoundedRect(0, 0, width, height, node.radius)
    }
    if (node.type === 'vector') {
      if (node.vectorType === 'rect') {
        graphics.drawRoundedRect(0, 0, width, height, node.radius)
      }
      if (node.vectorType === 'ellipse') {
        graphics.drawEllipse(width / 2, height / 2, width / 2, height / 2)
      }
      if (node.vectorType === 'polygon') {
        const polygon = createRegularPolygon(width, height, node.sides, rotation)
        graphics.drawPolygon(polygon)
      }
      if (node.vectorType === 'star') {
        const star = createStarPolygon(width, height, node.points, node.innerRate, rotation)
        graphics.drawPolygon(star)
      }
      if (node.vectorType === 'line') {
        graphics.moveTo(0, 0)
        graphics.lineTo(node.width, 0)
        graphics.containsPoint = pixiPolylineContainsPoint([
          xy_(node.x, node.y),
          xy_(node.x + node.width, node.y),
        ])
      }
      if (node.vectorType === 'irregular') {
        this.drawPath(node, graphics)
        this.drawIrregularHitArea(node, graphics)
      }
    }
  }

  private drawPath(node: IIrregular, element: PIXI.Graphics) {
    loopFor(node.points, (cur, next, last, i) => {
      if (i === node.points.length - 1 && cur.endPath) return element.closePath()
      if (cur.startPath) element.moveTo(cur.x, cur.y)
      if (cur.handleRight && next.handleLeft) {
        const [cp2, cp1] = [next.handleLeft, cur.handleRight]
        element.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, next.x, next.y)
      } else if (cur.handleRight) {
        element.quadraticCurveTo(cur.handleRight.x, cur.handleRight.y, next.x, next.y)
      } else if (next.handleLeft) {
        element.quadraticCurveTo(next.handleLeft.x, next.handleLeft.y, cur.x, cur.y)
      } else if (!next.startPath) {
        element.lineTo(next.x, next.y)
      }
    })
  }

  private getLinearGradientTexture(node: INode, fill: IFillLinearGradient) {
    return this.linearGradientCache.getSet(
      node.id,
      () => {
        const start = xy_(fill.start.x * node.width, fill.start.y * node.height)
        const end = xy_(fill.end.x * node.width, fill.end.y * node.height)
        return createLinearGradientTexture({ ...fill, start, end })
      },
      [node.width, node.height, fill.stops]
    )
  }

  private getImageTextureMatrix(node: INode, image: IImage) {
    const nodeRate = node.width / node.height
    const imageRate = image.width / image.height
    const texture =
      image.pixiTexture || iife(() => (image.pixiTexture = Texture.from(image.objectUrl)))
    const matrix = new Matrix()
    if (nodeRate > imageRate) {
      matrix.scale(node.width / image.width, node.width / image.width)
    } else {
      matrix.scale(node.height / image.height, node.height / image.height)
    }
    return { texture, matrix }
  }

  private drawIrregularHitArea(node: IIrregular, element: PIXI.Graphics) {
    const originPoints = node.points
    const newPoints = <IXY[]>[originPoints[0]]
    loopFor(originPoints, (cur, next) => {
      if (next.startPath) return
      if (cur.handleRight && next.handleLeft) {
        const points = pointsOnBezierCurves([cur, cur.handleRight, next.handleLeft, next], 0.3, 0.3)
        newPoints.push(...points.slice(1))
      } else if (cur.handleRight) {
        const points = pointsOnBezierCurves([cur, cur.handleRight, next, next], 0.3, 0.3)
        newPoints.push(...points.slice(1))
      } else if (next.handleLeft) {
        const points = pointsOnBezierCurves([cur, cur, next.handleLeft, next], 0.3, 0.3)
        newPoints.push(...points.slice(1))
      } else {
        newPoints.push(next)
      }
    })
    element.containsPoint = pixiPolylineContainsPoint(
      newPoints.map(({ x, y }) => xy_(node.x + x, node.y + y))
    )
  }

  private isText(element: IStageElement): element is Text {
    return element instanceof Text
  }
}

export const StageDraw = new StageDrawService()
