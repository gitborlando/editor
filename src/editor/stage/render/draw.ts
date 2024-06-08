import { ImgManager } from 'src/editor/editor/img'
import { max, radianfy, rcos, rsin } from 'src/editor/math/base'
import { pointsOnBezierCurves } from 'src/editor/math/bezier/points-of-bezier'
import { xy_, xy_from } from 'src/editor/math/xy'
import { SchemaDefault } from 'src/editor/schema/default'
import { Surface } from 'src/editor/stage/render/surface'
import { ISplitText } from 'src/editor/stage/render/text-break/text-breaker'
import { getZoom } from 'src/editor/stage/viewport'
import { loopFor } from 'src/shared/utils/array'
import { createObjCache } from 'src/shared/utils/cache'
import { hslBlueColor, rgba } from 'src/shared/utils/color'
import { IXY, iife } from 'src/shared/utils/normal'
import {
  IEllipse,
  IFill,
  IFillColor,
  IIrregular,
  INode,
  IPoint,
  IShadow,
  IStroke,
  IText,
} from '../../schema/type'
import { Elem } from './elem'

export const StageNodeDrawer = new (class {
  ctx!: CanvasRenderingContext2D
  node!: INode
  elem!: Elem
  path2d!: Path2D

  draw = (node: INode, elem: Elem, ctx: CanvasRenderingContext2D, path2d: Path2D) => {
    this.node = node
    this.elem = elem
    this.ctx = ctx
    this.path2d = path2d

    this.ctx.save()
    this.elem.setMatrix(this.ctx)

    this.drawShapePath()

    node.fills.forEach((fill, i) => {
      Surface.ctxSaveRestore(() => {
        if (node.shadows[i]) this.drawShadow(node.shadows[i])
        this.drawFill(fill)
      })
    })
    node.strokes.forEach((stroke, i) => {
      Surface.ctxSaveRestore(() => {
        if (node.shadows[i]) this.drawShadow(node.shadows[i])
        this.drawStroke(stroke)
      })
    })

    this.drawOutline()
    this.drawHitTest()

    this.ctx.restore()
  }

  private drawOutline() {
    if (!this.elem.outline) return

    const width = this.elem.outline === 'hover' ? 2 : 0.5

    Surface.ctxSaveRestore(() => {
      this.ctx.lineWidth = width / getZoom() / devicePixelRatio
      this.ctx.strokeStyle = hslBlueColor(65)
      this.ctx.stroke(new Path2D(this.path2d))
    })

    this.elem.outline = undefined
  }

  private drawShapePath = () => {
    const node = this.node
    const { width, height } = node

    switch (node.type) {
      case 'frame':
      case 'rect':
        this.drawRoundRect(width, height, node.radius)
        break

      case 'ellipse':
        this.drawEllipse()
        break

      case 'polygon':
        node.points = this.createRegularPolygon(width, height, node.sides)
        this.drawPolygon(node.points)
        break

      case 'star':
        node.points = this.createStarPolygon(width, height, node.pointCount, node.innerRate)
        this.drawPolygon(node.points)
        break

      case 'line':
        node.points = this.createLinePolygon(xy_(0, 0), node.width)
        this.drawPolygon(node.points)
        break

      case 'irregular':
        this.drawIrregular(node.points)
        break

      case 'text':
        this.breakText()
        if (this.elem.outline === 'hover') this.drawTextHoverLine()
        break
    }

    return this.path2d
  }

  private drawRoundRect = (width: number, height: number, radius: number) => {
    if (radius === 0) {
      this.path2d.rect(0, 0, width, height)
    } else {
      this.path2d.roundRect(0, 0, width, height, radius)
    }
  }

  private createLinePolygon(start: IXY, length: number) {
    const end = xy_(start.x + length, start.y)
    return [SchemaDefault.point(start), SchemaDefault.point(end)]
  }

  private createRegularPolygon(width: number, height: number, sides: number) {
    sides = Math.max(sides | 0, 3)
    const center = xy_(width / 2, height / 2)
    const radius = max(width, height) / 2
    const delta = 360 / sides
    return new Array(sides).fill(null).map((_, i) => {
      const angle = i * delta - 90
      if (width > height) {
        const x = center.x + rcos(angle) * radius
        const y = center.y + rsin(angle) * radius * (height / width)
        return SchemaDefault.point({ x, y })
      } else {
        const x = center.x + rcos(angle) * radius * (width / height)
        const y = center.y + rsin(angle) * radius
        return SchemaDefault.point({ x, y })
      }
    })
  }

  private createStarPolygon(width: number, height: number, points: number, innerRate: number) {
    points = max(points | 0, 3)
    const center = xy_(width / 2, height / 2)
    const outerRadius = max(width, height) / 2
    const innerRadius = innerRate * outerRadius
    const delta = 360 / points / 2
    return new Array(points * 2).fill(null).map((_, i) => {
      const radius = (-1) ** i === 1 ? outerRadius : innerRadius
      const angle = i * delta - 90
      if (width > height) {
        const x = center.x + rcos(angle) * radius
        const y = center.y + rsin(angle) * radius * (height / width)
        return SchemaDefault.point({ x, y })
      } else {
        const x = center.x + rcos(angle) * radius * (width / height)
        const y = center.y + rsin(angle) * radius
        return SchemaDefault.point({ x, y })
      }
    })
  }

  private drawPolygon = (xys: IXY[]) => {
    loopFor(xys, (cur, next, _, i) => {
      if (i === 0) this.path2d.moveTo(cur.x, cur.y)
      if (i === xys.length - 1) this.path2d.closePath()
      else this.path2d.lineTo(next.x, next.y)
    })
  }

  private drawEllipse = () => {
    const { width, height, startAngle, endAngle, innerRate } = this.node as IEllipse
    const [cx, cy] = [width / 2, height / 2]
    const startRadian = radianfy(startAngle)
    const endRadian = radianfy(endAngle)

    if (innerRate === 0) {
      if (startAngle === 0 && endAngle === 360) {
        this.path2d.ellipse(cx, cy, cx, cy, 0, startRadian, endRadian)
      } else {
        this.path2d.ellipse(cx, cy, cx, cy, 0, startRadian, endRadian)
        this.path2d.lineTo(cx, cy)
      }
    } else {
      if (startAngle === 0 && endAngle === 360) {
        this.path2d.ellipse(cx, cy, cx, cy, 0, startRadian, endRadian)
        this.path2d.moveTo(cx * (1 + innerRate), cy)
        this.path2d.ellipse(cx, cy, cx * innerRate, cy * innerRate, 0, startRadian, endRadian, true)
      } else {
        this.path2d.ellipse(cx, cy, cx, cy, 0, startRadian, endRadian)
        this.path2d.ellipse(cx, cy, cx * innerRate, cy * innerRate, 0, endRadian, startRadian, true)
      }
    }
    this.path2d.closePath()
  }

  private drawIrregular(points: IPoint[]) {
    loopFor(points, (cur, next, last, i) => {
      if (i === points.length - 1 && cur.endPath) {
        return this.path2d.closePath()
      }
      if (cur.startPath) {
        this.path2d.moveTo(cur.x, cur.y)
      }
      if (cur.handleRight && next.handleLeft) {
        const [cp2, cp1] = [next.handleLeft, cur.handleRight]
        this.path2d.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, next.x, next.y)
      } else if (cur.handleRight) {
        this.path2d.quadraticCurveTo(cur.handleRight.x, cur.handleRight.y, next.x, next.y)
      } else if (next.handleLeft) {
        this.path2d.quadraticCurveTo(next.handleLeft.x, next.handleLeft.y, cur.x, cur.y)
      } else if (!next.startPath) {
        this.path2d.lineTo(next.x, next.y)
      }
    })
  }

  private drawTextHoverLine() {
    const collideXys = this.getTextCollideXys()
    const { fontSize } = (this.node as IText).style

    for (let i = 0; i < collideXys.length; i += 2) {
      const p1 = collideXys[i]
      const p2 = collideXys[i + 1]
      this.path2d.moveTo(p1.x, p1.y + fontSize / 2)
      this.path2d.lineTo(p2.x, p2.y + fontSize / 2)
    }
  }

  private splitTextsCache = createObjCache<ISplitText[]>()
  private splitTexts!: ISplitText[]

  private breakText() {
    const { content, style, width } = this.node as IText
    const { fontWeight, fontSize, fontFamily, letterSpacing } = style

    this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
    this.ctx.textBaseline = 'top'
    this.ctx.letterSpacing = `${letterSpacing}px`

    this.splitTexts = this.splitTextsCache.getSet(
      this.node.id,
      () => Surface.textBreaker.breakText(content, width, style, letterSpacing),
      [content, width, style]
    )
  }

  private fillOrStrokeText = (op: 'fillText' | 'strokeText') => {
    const { style } = this.node as IText
    const { lineHeight } = style

    this.splitTexts.forEach(({ text, start }, i) => {
      this.ctx[op](text, start, i * lineHeight)
    })
  }

  private drawFill = (fill: IFill) => {
    if (!fill.visible) {
      this.ctx.fillStyle = rgba(0, 0, 0, 0.0001)
      return this.ctx.fill(this.path2d)
    }

    this.ctx.globalAlpha = fill.alpha

    const makeFill = () => {
      if (this.node.type === 'text') {
        this.fillOrStrokeText('fillText')
      } else {
        this.ctx.fill(this.path2d, 'evenodd')
      }
    }

    switch (fill.type) {
      case 'color':
        this.ctx.fillStyle = fill.color
        makeFill()
        break

      case 'linearGradient':
        const start = xy_(fill.start.x * this.node.width, fill.start.y * this.node.height)
        const end = xy_(fill.end.x * this.node.width, fill.end.y * this.node.height)

        const gradient = this.ctx.createLinearGradient(start.x, start.y, end.x, end.y)
        fill.stops.forEach(({ offset, color }) => gradient.addColorStop(offset, color))

        this.ctx.fillStyle = gradient
        makeFill()
        break

      case 'image':
        const image = ImgManager.getImage(fill.url)
        if (!image) {
          ImgManager.getImageAsync(fill.url).then(() => {
            Surface.collectDirtyRect(this.elem.aabb)
          })
        } else {
          const { width, height } = this.node
          const rate = iife(() => {
            if (image.width === 0 || image.height === 0) return 1
            const rateW = width / image.width
            const rateH = height / image.height
            return Math.max(rateW, rateH)
          })
          const path2d = new Path2D(this.path2d)
          this.ctx.clip(path2d)
          this.ctx.drawImage(image.image, 0, 0, width / rate, height / rate, 0, 0, width, height)
        }
        break
    }
  }

  private drawStroke = (stroke: IStroke) => {
    if (!stroke.visible) return

    this.ctx.lineWidth = stroke.width
    this.ctx.lineCap = stroke.cap
    this.ctx.lineJoin = stroke.join

    this.ctx.globalAlpha = stroke.fill.alpha

    switch (stroke.fill.type) {
      case 'color':
        this.ctx.strokeStyle = stroke.fill.color
        this.ctx.stroke(this.path2d)
        break

      default:
        break
    }
  }

  private drawShadow = (shadow: IShadow) => {
    if (!shadow.visible) return

    const { fill, blur, offsetX, offsetY, spread } = shadow

    this.ctx.shadowColor = (fill as IFillColor).color
    this.ctx.shadowBlur = blur
    this.ctx.shadowOffsetX = offsetX
    this.ctx.shadowOffsetY = offsetY
  }

  private drawHitTest = () => {
    const { eventHandle, obb } = this.elem
    const { width, height } = obb

    switch (this.node.type) {
      case 'frame':
      case 'rect':
        const radius = 'radius' in this.node ? this.node.radius : 0
        eventHandle.hitTest = eventHandle.hitRoundRect(width, height, radius)
        break

      case 'polygon':
      case 'star':
        eventHandle.hitTest = eventHandle.hitPolygon(this.node.points)
        break

      case 'ellipse':
        eventHandle.hitTest = eventHandle.hitEllipse(width / 2, height / 2, width / 2, height / 2)
        break

      case 'irregular':
      case 'line':
      case 'text':
        const xys = iife(() => {
          if (this.node.type === 'text') return this.getTextCollideXys()
          if (this.node.type === 'line') return this.node.points
          return this.getIrregularCollideXys()
        })
        eventHandle.hitTest = eventHandle.hitPolyline(xys, 10 / getZoom())
        break
    }
  }

  private irregularCollideXysCache = createObjCache<IXY[]>()

  private getIrregularCollideXys() {
    const points = (this.node as IIrregular).points

    return this.irregularCollideXysCache.getSet(
      this.node.id,
      () => {
        const collideXys = <IXY[]>[xy_from(points[0])]

        loopFor(points, (cur, next) => {
          if (next.startPath) return
          if (cur.handleRight && next.handleLeft) {
            const [cp2, cp1] = [cur.handleRight, next.handleLeft]
            const xys = pointsOnBezierCurves([cur, cp2, cp1, next], 0.3, 0.3)
            collideXys.push(...xys.slice(1))
          } else if (cur.handleRight) {
            const xys = pointsOnBezierCurves([cur, cur.handleRight, next, next], 0.3, 0.3)
            collideXys.push(...xys.slice(1))
          } else if (next.handleLeft) {
            const xys = pointsOnBezierCurves([cur, cur, next.handleLeft, next], 0.3, 0.3)
            collideXys.push(...xys.slice(1))
          } else {
            collideXys.push(xy_from(next))
          }
        })
        return collideXys
      },
      [points]
    )
  }

  private textCollideXysCache = createObjCache<IXY[]>()

  private getTextCollideXys() {
    const { content, style, width } = this.node as IText

    return this.textCollideXysCache.getSet(
      this.node.id,
      () => {
        const collideXys = <IXY[]>[]
        const { lineHeight, fontSize } = (this.node as IText).style

        this.splitTexts.forEach(({ start, width }, i) => {
          const y = i * lineHeight + fontSize / 2
          collideXys.push(xy_(start, y), xy_(start + width, y))
        })
        return collideXys
      },
      [content, style, width]
    )
  }
})()
