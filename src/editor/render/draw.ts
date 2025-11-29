import { createObjCache, loopFor } from '@gitborlando/utils'
import { Canvas, Font, Paint, Path } from 'canvaskit-wasm'
import autoBind from 'class-autobind-decorator'
import { ImgManager } from 'src/editor/editor/img-manager'
import { EditorSetting } from 'src/editor/editor/setting'
import { AABB } from 'src/editor/math'
import { max } from 'src/editor/math/base'
import { pointsOnBezierCurves } from 'src/editor/math/bezier/points-of-bezier'
import { xy_from } from 'src/editor/math/xy'
import { StageSurface } from 'src/editor/render/surface'
import { ISplitText } from 'src/editor/render/text-break/text-breaker'
import { getZoom } from 'src/editor/stage/viewport'
import { iife, IXY } from 'src/shared/utils/normal'
import { themeColor } from 'src/view/styles/color'
import { Elem, HitTest } from './elem'

@autoBind
class ElemDrawerService {
  private node!: V1.Node
  private elem!: Elem
  private ctx!: Canvas
  private path!: Path
  private dirtyRects: AABB[] = []
  private font?: Font

  draw = (elem: Elem, ctx: Canvas, path: Path) => {
    this.node = elem.node
    this.elem = elem
    this.ctx = ctx
    this.path = path
    this.dirtyRects = [elem.aabb]

    StageSurface.setOBBMatrix(this.elem.obb)

    this.drawShapePath()

    this.node.fills.forEach((fill, i) => {
      StageSurface.ctxSaveRestore(() => {
        this.drawShadow(this.node.shadows[i])
        this.drawFill(fill)
      })
    })

    this.node.strokes.forEach((stroke, i) => {
      StageSurface.ctxSaveRestore(() => {
        this.drawShadow(this.node.shadows[i])
        this.drawStroke(stroke)
      })
    })

    // this.drawOutline()
    this.drawTextDecoration()
    this.updateHitTest()
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

      // case 'line':
      //   this.drawLine(node.points)
      //   break

      case 'polygon':
      case 'star':
      case 'irregular':
      case 'line':
        this.drawPath(node.points)
        break

      case 'text':
        this.breakText()

        const { lineHeight } = node.style
        this.dirtyRects.push(AABB.extend(this.elem.aabb, 0, lineHeight / 2, 0, 0))

        const dirtyHeight = lineHeight * this.splitTexts.length
        this.dirtyRects.push(
          AABB.extend(this.elem.aabb, 0, 0, 0, this.elem.aabb.minY + dirtyHeight),
        )
        break
    }
  }

  private drawRoundRect = (width: number, height: number, radius: number) => {
    const ck = StageSurface.ck
    if (radius === 0) {
      this.path.addRect(ck.XYWHRect(0, 0, width, height))
    } else {
      const rrect = ck.RRectXY(ck.XYWHRect(0, 0, width, height), radius, radius)
      this.path.addRRect(rrect)
    }
  }

  private drawEllipse = () => {
    const { width, height, startAngle, endAngle, innerRate } = this
      .node as V1.Ellipse
    const [cx, cy] = [width / 2, height / 2]
    const startRadian = Angle.radianFy(startAngle)
    const endRadian = Angle.radianFy(endAngle)
    const ck = StageSurface.ck

    if (innerRate === 0) {
      if (startAngle === 0 && endAngle === 360) {
        this.path.addOval(ck.XYWHRect(0, 0, width, height))
      } else {
        this.path.addArc(
          ck.XYWHRect(0, 0, width, height),
          startAngle,
          endAngle - startAngle,
        )
        this.path.lineTo(cx, cy)
      }
    } else {
      if (startAngle === 0 && endAngle === 360) {
        this.path.addOval(ck.XYWHRect(0, 0, width, height))
        const innerWidth = width * innerRate
        const innerHeight = height * innerRate
        const innerRect = ck.XYWHRect(
          cx - innerWidth / 2,
          cy - innerHeight / 2,
          innerWidth,
          innerHeight,
        )
        this.path.addOval(innerRect, false)
      } else {
        this.path.addArc(
          ck.XYWHRect(0, 0, width, height),
          startAngle,
          endAngle - startAngle,
        )
        const innerWidth = width * innerRate
        const innerHeight = height * innerRate
        const innerRect = ck.XYWHRect(
          cx - innerWidth / 2,
          cy - innerHeight / 2,
          innerWidth,
          innerHeight,
        )
        this.path.addArc(innerRect, endAngle, startAngle - endAngle)
      }
    }
    this.path.close()
  }

  private drawLine = (points: V1.Point[]) => {
    // console.log('points: ', points)
    // const startX = nearestPixel(points[0].x)
    // const startY = nearestPixel(points[0].y)
    // const endX = nearestPixel(points[1].x)
    // const endY = nearestPixel(points[1].y)
    // this.path2d.moveTo(startX, startY)
    // this.path2d.lineTo(endX, endY)
    // this.path2d.closePath()
  }

  private drawPath(points: V1.Point[]) {
    loopFor(points, (cur, next, last, i) => {
      if (i === points.length - 1 && cur.endPath) {
        this.path.close()
        return
      }
      if (cur.startPath) {
        this.path.moveTo(cur.x, cur.y)
      }
      if (cur.handleR && next.handleL) {
        const [cp2, cp1] = [next.handleL, cur.handleR]
        this.path.cubicTo(cp1.x, cp1.y, cp2.x, cp2.y, next.x, next.y)
      } else if (cur.handleR) {
        this.path.quadTo(cur.handleR.x, cur.handleR.y, next.x, next.y)
      } else if (next.handleL) {
        this.path.quadTo(next.handleL.x, next.handleL.y, cur.x, cur.y)
      } else if (!next.startPath) {
        this.path.lineTo(next.x, next.y)
      }
    })
  }

  private splitTextsCache = createObjCache<ISplitText[]>()
  private splitTexts!: ISplitText[]

  private breakText() {
    const { content, style, width } = this.node as V1.Text
    const { fontWeight, fontSize, fontFamily, letterSpacing } = style

    // 使用 CanvasKit Font
    // TODO: 根据 fontWeight, fontSize, fontFamily 创建 Font 对象
    // 暂时保留文本分割逻辑

    this.splitTexts = this.splitTextsCache.getSet(
      this.node.id,
      () => StageSurface.textBreaker.breakText(content, width, style, letterSpacing),
      [content, width, style],
    )
  }

  private fillOrStrokeText = (paint: Paint) => {
    const { style } = this.node as V1.Text
    const { lineHeight, fontSize } = style
    const ck = StageSurface.ck

    this.splitTexts.forEach(({ text, start, width }, i) => {
      if (EditorSetting.setting.ignoreUnVisible) {
        const visualWidth = width * getZoom()
        const visualHeight = lineHeight * getZoom()
        if (visualWidth / text.length < 2.5 || visualHeight < 2.5) {
          const rectPaint = new ck.Paint()
          rectPaint.setStyle(ck.PaintStyle.Fill)
          rectPaint.setColor(paint.getColor())
          this.ctx.drawRect(
            ck.XYWHRect(start, i * lineHeight, width, lineHeight * 0.2),
            rectPaint,
          )
          rectPaint.delete()
          return
        }
      }

      // 使用 CanvasKit 文本 API
      if (this.font) {
        const textBlob = ck.TextBlob.MakeFromText(text, this.font)
        if (textBlob) {
          this.ctx.drawTextBlob(textBlob, start, i * lineHeight + fontSize, paint)
          textBlob.delete()
        }
      }
    })
  }

  private drawFill = (fill: V1.Fill) => {
    const ck = StageSurface.ck
    const paint = new ck.Paint()
    paint.setStyle(ck.PaintStyle.Fill)
    paint.setAntiAlias(true)

    if (!fill.visible) {
      paint.setColor(ck.Color(0, 0, 0, 0.0001))
      this.ctx.drawPath(this.path, paint)
      paint.delete()
      return
    }

    paint.setAlphaf(fill.alpha)

    const makeFill = () => {
      if (this.node.type === 'text') {
        this.fillOrStrokeText(paint)
      } else {
        this.ctx.drawPath(this.path, paint)
      }
    }

    switch (fill.type) {
      case 'color':
        const color = this.parseColor(fill.color)
        paint.setColor(color)
        makeFill()
        break

      case 'linearGradient':
        const start = XY._(
          fill.start.x * this.node.width,
          fill.start.y * this.node.height,
        )
        const end = XY._(fill.end.x * this.node.width, fill.end.y * this.node.height)

        const colors = fill.stops.map((s) => this.parseColor(s.color))
        const positions = fill.stops.map((s) => s.offset)

        const shader = ck.Shader.MakeLinearGradient(
          [start.x, start.y],
          [end.x, end.y],
          colors,
          positions,
          ck.TileMode.Clamp,
        )

        paint.setShader(shader)
        makeFill()
        shader.delete()
        break

      case 'image':
        const image = ImgManager.getImage(fill.url)
        if (!image) {
          ImgManager.getImageAsync(fill.url).then(() => {
            StageSurface.collectDirty(this.elem)
          })
        } else {
          const { width, height } = this.node
          const rate = iife(() => {
            if (image.width === 0 || image.height === 0) return 1
            const rateW = width / image.width
            const rateH = height / image.height
            return Math.max(rateW, rateH)
          })

          // 使用 CanvasKit 裁剪和绘制图像
          this.ctx.save()
          this.ctx.clipPath(this.path, ck.ClipOp.Intersect, true)

          // 将 HTMLImageElement 转换为 CanvasKit Image
          const skImage = ck.MakeImageFromCanvasImageSource(image.image)
          if (skImage) {
            const srcRect = ck.XYWHRect(0, 0, width / rate, height / rate)
            const dstRect = ck.XYWHRect(0, 0, width, height)
            this.ctx.drawImageRect(skImage, srcRect, dstRect, paint)
            skImage.delete()
          }

          this.ctx.restore()
        }
        break
    }

    paint.delete()
  }

  private parseColor(cssColor: string): Float32Array {
    const ck = StageSurface.ck
    // 简单的 CSS 颜色解析
    if (cssColor.startsWith('rgba')) {
      const match = cssColor.match(
        /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
      )
      if (match) {
        const [, r, g, b, a = '1'] = match
        return ck.Color(parseInt(r), parseInt(g), parseInt(b), parseFloat(a))
      }
    } else if (cssColor.startsWith('rgb')) {
      const match = cssColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      if (match) {
        const [, r, g, b] = match
        return ck.Color(parseInt(r), parseInt(g), parseInt(b), 1)
      }
    } else if (cssColor.startsWith('#')) {
      const hex = cssColor.slice(1)
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1
      return ck.Color(r, g, b, a)
    }
    // 默认黑色
    return ck.Color(0, 0, 0, 1)
  }

  private drawStroke = (stroke: V1.Stroke) => {
    if (!stroke.visible) return

    const ck = StageSurface.ck
    const paint = new ck.Paint()
    paint.setStyle(ck.PaintStyle.Stroke)
    paint.setStrokeWidth(stroke.width)

    // 设置线帽样式
    const capMap: Record<string, any> = {
      butt: ck.StrokeCap.Butt,
      round: ck.StrokeCap.Round,
      square: ck.StrokeCap.Square,
    }
    paint.setStrokeCap(capMap[stroke.cap] || ck.StrokeCap.Butt)

    // 设置线连接样式
    const joinMap: Record<string, any> = {
      miter: ck.StrokeJoin.Miter,
      round: ck.StrokeJoin.Round,
      bevel: ck.StrokeJoin.Bevel,
    }
    paint.setStrokeJoin(joinMap[stroke.join] || ck.StrokeJoin.Miter)
    paint.setAntiAlias(true)
    paint.setAlphaf(stroke.fill.alpha)

    switch (stroke.fill.type) {
      case 'color':
        const color = this.parseColor(stroke.fill.color)
        paint.setColor(color)
        this.ctx.drawPath(this.path, paint)
        break

      default:
        break
    }

    paint.delete()

    switch (stroke.align) {
      case 'center':
        this.dirtyRects.push(AABB.extend(this.elem.aabb, stroke.width / 2))
        break
      case 'outer':
        this.dirtyRects.push(AABB.extend(this.elem.aabb, stroke.width))
    }
  }

  private drawShadow = (shadow?: V1.Shadow) => {
    if (!shadow?.visible) return

    let { fill, blur, offsetX, offsetY, spread } = shadow
    offsetX = offsetX * getZoom()
    offsetY = offsetY * getZoom()
    blur = blur * getZoom()

    const ck = StageSurface.ck
    const color = this.parseColor((fill as V1.FillColor).color)

    // 使用 CanvasKit 的 MaskFilter 创建阴影效果
    const shadowPaint = new ck.Paint()
    shadowPaint.setColor(color)
    shadowPaint.setMaskFilter(
      ck.MaskFilter.MakeBlur(ck.BlurStyle.Normal, blur / 2, true),
    )

    // 绘制偏移的阴影
    this.ctx.save()
    this.ctx.translate(offsetX, offsetY)
    this.ctx.drawPath(this.path, shadowPaint)
    this.ctx.restore()

    shadowPaint.delete()

    this.dirtyRects.push(
      AABB.extend(
        this.elem.aabb,
        -offsetX + blur,
        -offsetY + blur,
        offsetX + blur,
        offsetY + blur,
      ),
    )
  }

  private drawOutline = () => {
    if (!this.node.outline) return

    const { width, color } = this.node.outline
    if (width <= 0) return

    const ck = StageSurface.ck

    StageSurface.ctxSaveRestore(() => {
      const paint = new ck.Paint()
      paint.setStyle(ck.PaintStyle.Stroke)
      paint.setStrokeWidth(width)
      paint.setAntiAlias(true)

      const strokeColor = this.parseColor(color || themeColor())
      paint.setColor(strokeColor)

      this.ctx.drawPath(this.path, paint)
      paint.delete()
    })
  }

  private drawTextDecoration() {
    if (this.node.type !== 'text') return
    if (!this.node.style.decoration) return

    const { style, color, width } = this.node.style.decoration
    if (!style || style === 'none' || width <= 0) return

    const ck = StageSurface.ck
    const collideXys = this.getTextCollideXys()
    const { fontSize } = (this.node as V1.Text).style

    const decorationPath = new ck.Path()
    for (let i = 0; i < collideXys.length; i += 2) {
      const p1 = collideXys[i]
      const p2 = collideXys[i + 1]
      decorationPath.moveTo(p1.x, p1.y + fontSize / 2)
      decorationPath.lineTo(p2.x, p2.y + fontSize / 2)
    }

    StageSurface.ctxSaveRestore(() => {
      const paint = new ck.Paint()
      paint.setStyle(ck.PaintStyle.Stroke)
      paint.setStrokeWidth(width)
      paint.setAntiAlias(true)

      const strokeColor = this.parseColor(color || themeColor())
      paint.setColor(strokeColor)

      this.ctx.drawPath(decorationPath, paint)
      paint.delete()
    })

    decorationPath.delete()
  }

  private updateHitTest = () => {
    const { width, height } = this.elem.obb

    switch (this.node.type) {
      case 'frame':
      case 'rect':
        const radius = 'radius' in this.node ? this.node.radius : 0
        this.elem.hitTest = HitTest.hitRoundRect(width, height, radius)
        break

      case 'polygon':
      case 'star': {
        this.elem.hitTest = HitTest.hitPolygon(this.node.points)
        break
      }

      case 'ellipse':
        const { startAngle, endAngle, innerRate } = this.node
        this.elem.hitTest = HitTest.hitEllipse(
          width / 2,
          height / 2,
          width / 2,
          height / 2,
          startAngle,
          endAngle,
          innerRate,
        )
        break

      case 'irregular':
      case 'line':
        const { points, strokes } = this.node
        this.elem.eventHandle.cacheHitTest(() => {
          const xys = iife(() => {
            if (this.node.type === 'line') return points
            return this.getPathCollideXys()
          })
          const strokeWidth = max(...strokes.map((s) => s.width))
          return HitTest.hitPolyline(xys, strokeWidth * 2)
        }, [points, strokes])
        break

      case 'text': {
        const { content, style, width } = this.node
        this.elem.eventHandle.cacheHitTest(
          () => HitTest.hitPolyline(this.getTextCollideXys(), style.lineHeight),
          [content, style, width],
        )
        break
      }
    }
  }

  private getPathCollideXys() {
    const points = (this.node as V1.Path).points
    const collideXys = <IXY[]>[xy_from(points[0])]

    loopFor(points, (cur, next) => {
      if (next.startPath) return
      if (cur.handleR && next.handleL) {
        const [cp2, cp1] = [cur.handleR, next.handleL]
        const xys = pointsOnBezierCurves([cur, cp2, cp1, next], 0.3, 0.3)
        collideXys.push(...xys.slice(1))
      } else if (cur.handleR) {
        const xys = pointsOnBezierCurves([cur, cur.handleR, next, next], 0.3, 0.3)
        collideXys.push(...xys.slice(1))
      } else if (next.handleL) {
        const xys = pointsOnBezierCurves([cur, cur, next.handleL, next], 0.3, 0.3)
        collideXys.push(...xys.slice(1))
      } else {
        collideXys.push(xy_from(next))
      }
    })

    return collideXys
  }

  private getTextCollideXys() {
    const collideXys = <IXY[]>[]
    const { lineHeight, fontSize } = (this.node as V1.Text).style

    this.splitTexts.forEach(({ start, width }, i) => {
      const y = i * lineHeight + fontSize / 2
      collideXys.push(XY._(start, y), XY._(start + width, y))
    })

    return collideXys
  }
}

export const ElemDrawer = new ElemDrawerService()
