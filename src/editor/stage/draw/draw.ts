import { DropShadowFilter } from '@pixi/filter-drop-shadow'
import autobind from 'class-autobind-decorator'
import { Graphics, Matrix, Text, Texture } from 'pixi.js'
import { IImage, Img } from '~/editor/img'
import { radianfy } from '~/editor/math/base'
import { xy_new } from '~/editor/math/xy'
import { SchemaNode } from '~/editor/schema/node'
import { IFillLinearGradient, IFrame, IIrregular, INode, IVector } from '~/editor/schema/type'
import { XY } from '~/shared/structure/xy'
import { rgb, rgbToHex, rgbToRgba } from '~/shared/utils/color'
import { iife } from '~/shared/utils/normal'
import { createLinearGradientTexture } from '~/shared/utils/pixi/linear-gradient'
import { createRegularPolygon } from '~/shared/utils/pixi/regular-polygon'
import { createStarPolygon } from '~/shared/utils/pixi/star'
import { IStageElement, StageElement } from '../element'
import { PIXI, Pixi } from '../pixi'
import { StageViewport } from '../viewport'
import { StageDrawPath } from './path'

@autobind
export class StageDrawService {
  private redrawIds = new Set<string>()
  initHook() {
    SchemaNode.afterFlushDirty.hook(() => {
      this.redrawIds.forEach((id) => {
        const node = SchemaNode.find(id)
        node && this.drawNode(node)
      })
      this.redrawIds.clear()
    })
  }
  collectRedraw(id: string) {
    this.redrawIds.add(id)
  }
  private drawNode(node: INode) {
    const element = StageElement.findOrCreate(node)
    if ('clear' in element) element.clear()
    this.drawFills(element, node)
    this.drawStrokes(element, node)
    this.drawShadows(element, node)
  }
  private drawFills<T extends INode = INode>(element: IStageElement, node: T) {
    const mask = StageElement.maskCache.get(node.id)
    mask?.beginFill(rgb(0, 0, 0), 0.001)
    node.fills.forEach((fill) => {
      if (!fill.visible) return
      if (fill.type === 'color') {
        if (this.isText(element)) element.style.fill = rgbToRgba(fill.color, fill.alpha)
        else element.beginFill(fill.color, fill.alpha)
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
      const { fill, width, align } = stroke
      const alignment = { inner: 0, center: 0.5, outer: 1 }[align]
      if (fill.type === 'color') {
        if (this.isText(element)) return
        element.lineStyle({ width, color: fill.color, alignment, alpha: fill.alpha })
        this.drawShape(element, <IVector>node)
      }
      if (fill.type === 'image') {
        if (this.isText(element)) return
        const image = Img.getImage(fill.url)
        const draw = (image: IImage) => {
          const { texture, matrix } = this.getImageTextureMatrix(node, image)
          element.lineTextureStyle({ width, alignment, texture, matrix, alpha: fill.alpha })
          this.drawShape(element, <IVector>node)
        }
        image ? draw(image) : Img.getImageAsync(fill.url).then(draw)
      }
      if (fill.type === 'linearGradient') {
        if (this.isText(element)) return
        const texture = this.getLinearGradientTexture(node, fill)
        element.lineTextureStyle({ width, texture, alignment, alpha: fill.alpha })
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
      const filter = new DropShadowFilter({
        offset: { x: offsetX, y: offsetY },
        color: Number(`0x${rgbToHex(fill.color)}`),
        alpha: fill.alpha,
        blur,
        quality: 60,
      })
      element.filters?.push(filter)
      element.filterArea = new PIXI.Rectangle(0, 0, 9999, 9999)
    })
  }
  setGeometry(element: IStageElement, node: INode) {
    const rotation = radianfy(node.rotation)
    const pivotXY = this.getElementPivotXY(node)
    element.x = pivotXY.x
    element.y = pivotXY.y
    element.rotation = rotation
  }
  drawShape(element: IStageElement, node: INode) {
    this.setGeometry(element, node)
    const { width, height, rotation } = node
    const graphics = element as Graphics
    const text = element as Text
    if (node.type === 'frame') {
      // this.drawFrameName(node)
      const mask = StageElement.maskCache.get(node.id)
      this.setGeometry(mask, node)
      mask.drawRoundedRect(0, 0, width, height, node.radius)
      graphics.drawRoundedRect(0, 0, width, height, node.radius)
    }
    if (node.type === 'text') {
      text.text = node.content
      const wordWrapWidth = node.width
      // const lineHeight = node.style.fontSize
      text.style = { ...text.style, ...node.style, wordWrapWidth }
      text.style.wordWrap = true
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
        this.drawHitArea(node, graphics)
      }
      if (node.vectorType === 'irregular') {
        const path = StageElement.pathCache.getSet(node.id, () =>
          StageDrawPath.createPath(<IIrregular>node)
        )
        StageDrawPath.drawPath(path, graphics)
      }
    }
  }
  private drawHitArea(node: INode, element: PIXI.Graphics) {
    const contains = StageElement.hitAreaCache.getSet(
      node.id,
      () => {
        return (x: number, y: number) => {
          const points = element.geometry.points
          // const odds: { x: number; y: number; z: number }[] = []
          // const evens: { x: number; y: number; z: number }[] = []
          // for (let index = 0; index * 2 < points.length; index++) {
          //   const x = points[index * 2]
          //   const y = points[index * 2 + 1]
          //   const z = points[index * 2 + 2]
          //   index % 2 === 0 ? odds.push({ x, y, z }) : evens.push({ x, y, z })
          // }
          const odds: { x: number; y: number }[] = []
          const evens: { x: number; y: number }[] = []
          for (let index = 0; index * 2 < points.length; index++) {
            const x = points[index * 2]
            const y = points[index * 2 + 1]
            index % 2 === 0 ? odds.push({ x, y: y - 5 }) : evens.push({ x, y: y + 5 })
          }
          return new PIXI.Polygon([...odds, ...evens.reverse()]).contains(x, y)
        }
      },
      [element.geometry.points.reduce((all, i) => all + i, 0)]
    )
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
  private getLinearGradientTexture(node: INode, fill: IFillLinearGradient) {
    return StageElement.linearGradientCache.getSet(
      fill,
      () => {
        const start = xy_new(fill.start.x * node.width, fill.start.y * node.height)
        const end = xy_new(fill.end.x * node.width, fill.end.y * node.height)
        return createLinearGradientTexture({ ...fill, start, end })
      },
      [node.width, node.height, ...fill.stops.map((i) => `${i.color},${i.offset}`)]
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
  private isText(element: IStageElement): element is Text {
    return element instanceof Text
  }
}

export const StageDraw = new StageDrawService()
