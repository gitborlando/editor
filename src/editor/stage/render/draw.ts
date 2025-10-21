import { createObjCache, loopFor } from '@gitborlando/utils'
import autoBind from 'class-autobind-decorator'
import { ImgManager } from 'src/editor/editor/img-manager'
import { EditorSetting } from 'src/editor/editor/setting'
import { max, radianfy } from 'src/editor/math/base'
import { pointsOnBezierCurves } from 'src/editor/math/bezier/points-of-bezier'
import { AABB } from 'src/editor/math/obb'
import { xy_, xy_from } from 'src/editor/math/xy'
import { Surface } from 'src/editor/stage/render/surface'
import { ISplitText } from 'src/editor/stage/render/text-break/text-breaker'
import { getZoom } from 'src/editor/stage/viewport'
import { hslBlueColor } from 'src/shared/utils/color'
import { IXY, iife, matchCase, memorize } from 'src/shared/utils/normal'
import { rgba } from 'src/utils/color'
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
import { Elem, ElemHitUtil } from './elem'

@autoBind
class StageNodeDrawerService {
  private node!: INode
  private elem!: Elem
  private ctx!: CanvasRenderingContext2D
  private path2d!: Path2D
  private dirtyRects: AABB[] = []

  draw = (node: INode, elem: Elem, ctx: CanvasRenderingContext2D, path2d: Path2D) => {
    this.node = node
    this.elem = elem
    this.ctx = ctx
    this.path2d = path2d
    this.dirtyRects = [elem.aabb]

    this.elem.setMatrix(this.ctx)
    this.drawShapePath()

    node.fills.forEach((fill, i) => {
      Surface.ctxSaveRestore(() => {
        this.drawShadow(node.shadows[i])
        this.drawFill(fill)
      })
    })
    node.strokes.forEach((stroke, i) => {
      Surface.ctxSaveRestore(() => {
        this.drawShadow(node.shadows[i])
        this.drawStroke(stroke)
      })
    })

    this.drawOutline()
    this.drawHitTest()

    const dirtyRect = AABB.Merge([...this.dirtyRects])
    elem.getDirtyRect = (expand) => expand(dirtyRect, 1)
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
      case 'star':
      case 'line':
      case 'irregular':
        this.drawIrregular(node.points)
        break

      case 'text':
        this.breakText()
        if (this.elem.outline === 'hover') this.drawTextHoverPath()

        const { lineHeight } = node.style
        this.dirtyRects.push(AABB.Expand(this.elem.aabb, 0, lineHeight / 2, 0, 0))

        const dirtyHeight = lineHeight * this.splitTexts.length
        this.dirtyRects.push(
          AABB.Expand(this.elem.aabb, 0, 0, 0, this.elem.aabb.minY + dirtyHeight),
        )
        break
    }
  }

  private drawRoundRect = (width: number, height: number, radius: number) => {
    if (radius === 0) {
      this.path2d.rect(0, 0, width, height)
    } else {
      this.path2d.roundRect(0, 0, width, height, radius)
    }
  }

  private drawPolygon = (xys: IPoint[]) => {
    return this.drawIrregular(xys)
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
      if (cur.handleR && next.handleL) {
        const [cp2, cp1] = [next.handleL, cur.handleR]
        this.path2d.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, next.x, next.y)
      } else if (cur.handleR) {
        this.path2d.quadraticCurveTo(cur.handleR.x, cur.handleR.y, next.x, next.y)
      } else if (next.handleL) {
        this.path2d.quadraticCurveTo(next.handleL.x, next.handleL.y, cur.x, cur.y)
      } else if (!next.startPath) {
        this.path2d.lineTo(next.x, next.y)
      }
    })
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
      [content, width, style],
    )
  }

  private fillOrStrokeText = (op: 'fillText' | 'strokeText') => {
    const { style } = this.node as IText
    const { lineHeight } = style

    this.splitTexts.forEach(({ text, start, width }, i) => {
      if (EditorSetting.setting.ignoreUnVisible) {
        const visualWidth = width * getZoom()
        const visualHeight = lineHeight * getZoom()
        if (visualWidth / text.length < 2.5 || visualHeight < 2.5) {
          this.ctx.fillRect(start, i * lineHeight, width, lineHeight * 0.2)
          return
        }
      }

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
            Surface.collectDirty(this.elem)
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

    switch (stroke.align) {
      case 'center':
        this.dirtyRects.push(AABB.Expand(this.elem.aabb, stroke.width / 2))
        break
      case 'outer':
        this.dirtyRects.push(AABB.Expand(this.elem.aabb, stroke.width))
    }
  }

  private drawShadow = (shadow?: IShadow) => {
    if (!shadow?.visible) return

    let { fill, blur, offsetX, offsetY, spread } = shadow
    offsetX = offsetX * getZoom()
    offsetY = offsetY * getZoom()
    blur = blur * getZoom()

    this.ctx.shadowColor = (fill as IFillColor).color
    this.ctx.shadowBlur = blur
    this.ctx.shadowOffsetX = offsetX
    this.ctx.shadowOffsetY = offsetY

    this.dirtyRects.push(
      AABB.Expand(this.elem.aabb, -offsetX + blur, -offsetY + blur, offsetX + blur, offsetY + blur),
    )
  }

  private parseOutline = memorize((outlineStr: string) => {
    const outline = matchCase(outlineStr, outlineStr, {
      hover: `1.5-${hslBlueColor(65)}`,
      select: `1-${hslBlueColor(65)}`,
    })
    return [Number(outline.split('-')[0]), outline.split('-')[1]] as const
  })

  private drawOutline = () => {
    if (!this.elem.outline) return

    const [width, color] = this.parseOutline(this.elem.outline)

    Surface.ctxSaveRestore(() => {
      this.ctx.lineWidth = width / getZoom() / devicePixelRatio
      this.ctx.strokeStyle = color || hslBlueColor(65)
      this.ctx.stroke(new Path2D(this.path2d))
    })
  }

  private drawTextHoverPath() {
    const collideXys = this.getTextCollideXys()
    const { fontSize } = (this.node as IText).style

    for (let i = 0; i < collideXys.length; i += 2) {
      const p1 = collideXys[i]
      const p2 = collideXys[i + 1]
      this.path2d.moveTo(p1.x, p1.y + fontSize / 2)
      this.path2d.lineTo(p2.x, p2.y + fontSize / 2)
    }
  }

  private drawHitTest = () => {
    const { width, height } = this.elem.obb

    switch (this.node.type) {
      case 'frame':
      case 'rect':
        const radius = 'radius' in this.node ? this.node.radius : 0
        this.elem.hitTest = ElemHitUtil.HitRoundRect(width, height, radius)
        break

      case 'polygon':
      case 'star': {
        this.elem.hitTest = ElemHitUtil.HitPolygon(this.node.points)
        break
      }

      case 'ellipse':
        const { startAngle, endAngle, innerRate } = this.node
        this.elem.hitTest = ElemHitUtil.HitEllipse(
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
            return this.getIrregularCollideXys()
          })
          const strokeWidth = max(...strokes.map((s) => s.width))
          return ElemHitUtil.HitPolyline(xys, strokeWidth * 2)
        }, [points, strokes])
        break

      case 'text': {
        const { content, style, width } = this.node
        this.elem.eventHandle.cacheHitTest(
          () => ElemHitUtil.HitPolyline(this.getTextCollideXys(), style.lineHeight),
          [content, style, width],
        )
        break
      }
    }
  }

  private getIrregularCollideXys() {
    const points = (this.node as IIrregular).points
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
    const { lineHeight, fontSize } = (this.node as IText).style

    this.splitTexts.forEach(({ start, width }, i) => {
      const y = i * lineHeight + fontSize / 2
      collideXys.push(xy_(start, y), xy_(start + width, y))
    })

    return collideXys
  }
}

export const StageNodeDrawer = new StageNodeDrawerService()
