import { radianfy } from 'src/editor/math/base'
import { xy_, xy_distance } from 'src/editor/math/xy'
import { StageScene } from 'src/editor/stage/render/scene'
import { createRegularPolygon, createStarPolygon } from 'src/editor/stage/render/shape'
import { Surface } from 'src/editor/stage/render/surface'
import { StageViewport } from 'src/editor/stage/viewport'
import { loopFor } from 'src/shared/utils/array'
import { inPolygon } from 'src/shared/utils/collision'
import { hslBlueColor, rgba } from 'src/shared/utils/color'
import { IXY } from 'src/shared/utils/normal'
import { IFill, INode, IStroke } from '../../schema/type'
import { Elem } from './elem'

export const NodeDrawer = new (class {
  ctx!: CanvasRenderingContext2D
  node!: INode
  elem!: Elem
  path2d!: Path2D
  zoom!: number

  initHook() {
    Surface.inited.hook(() => {
      this.ctx = Surface.ctx
    })
    Surface.beforeRender.hook(() => {
      this.zoom = StageViewport.zoom.value
    })
  }

  draw = (node: INode, elem: Elem) => {
    this.node = node
    this.elem = elem

    this.ctx.save()
    this.setMatrix()

    const effectCount =
      node.fills.length > node.strokes.length ? node.fills.length : node.strokes.length
    for (let i = 0; i < effectCount; i++) {
      this.ctx.save()

      this.drawShapePath(node)
      if (node.fills[i]) {
        this.drawFill(node.fills[i])
        this.ctx.fill(this.path2d)
      }
      if (node.strokes[i]) {
        this.drawStroke(node.strokes[i])
        this.ctx.stroke(this.path2d)
      }

      this.drawHitTest()

      this.ctx.restore()
    }
    this.ctx.restore()
  }

  drawOutline(type: 'hover' | 'select', node: INode) {
    const elem = StageScene.elements.get(node.id)
    this.elem = elem

    this.ctx.save()
    this.setMatrix()

    const width = type === 'hover' ? 2 : 0.5
    this.ctx.lineWidth = width / this.zoom / devicePixelRatio
    this.ctx.strokeStyle = hslBlueColor(65)
    this.drawShapePath(node)
    this.ctx.stroke(this.path2d)

    this.ctx.restore()
  }

  drawShapePath = (node: INode) => {
    this.node = node
    this.path2d = new Path2D()

    const { x, y, width, height, rotation } = this.node

    switch (this.node.type) {
      case 'frame':
      case 'rect':
        if (this.node.radius === 0) {
          this.path2d.rect(0, 0, width, height)
        } else {
          this.path2d.roundRect(0, 0, width, height, this.node.radius)
        }
        break

      case 'polygon':
        this.node.points = createRegularPolygon(width, height, this.node.sides, rotation)
        this.drawPolygon(this.node.points)
        break

      case 'star':
        this.node.points = createStarPolygon(width, height, this.node.sides, rotation)
        this.drawPolygon(this.node.points)
        break

      case 'text':
        break
    }

    return this.path2d
  }

  private drawFill = (fill: IFill) => {
    if (!fill.visible) {
      return (this.ctx.fillStyle = rgba(0, 0, 0, 0.0001))
    }

    switch (fill.type) {
      case 'color':
        this.ctx.fillStyle = fill.color
        break

      case 'linearGradient':
        const start = xy_(fill.start.x * this.node.width, fill.start.y * this.node.height)
        const end = xy_(fill.end.x * this.node.width, fill.end.y * this.node.height)
        const gradient = this.ctx.createLinearGradient(start.x, start.y, end.x, end.y)
        fill.stops.forEach(({ offset, color }) => gradient.addColorStop(offset, color))
        this.ctx.fillStyle = gradient
        break

      default:
        break
    }
  }

  private drawStroke = (stroke: IStroke) => {
    if (!stroke.visible) return

    switch (stroke.fill.type) {
      case 'color':
        this.ctx.strokeStyle = stroke.fill.color
        break

      default:
        break
    }
  }

  private setMatrix = () => {
    const { x, y, rotation } = this.elem.obb
    this.ctx.translate(x, y)
    this.ctx.rotate(radianfy(rotation))
  }

  private drawPolygon = (xys: IXY[]) => {
    loopFor(xys, (cur, next, _, i) => {
      if (i === 0) this.path2d.moveTo(cur.x, cur.y)
      if (i === xys.length - 1) this.path2d.closePath()
      else this.path2d.lineTo(next.x, next.y)
    })
  }

  private drawHitTest = () => {
    const { x, y, width, height, rotation } = this.node

    switch (this.node.type) {
      case 'frame':
      case 'rect':
      case 'group':
        this.elem.hitTest = (xy) => {
          const r = 'radius' in this.node ? this.node.radius : 0
          const inRect = xy.x >= x && xy.x <= x + width && xy.y >= y && xy.y <= y + height
          if (r === 0) {
            return inRect
          } else {
            if (!inRect) return false
            if (xy_distance(xy, xy_(x, x + width)) > r) return false
            if (xy_distance(xy, xy_(y, y + height)) > r) return false
            if (xy_distance(xy, xy_(x + width, y)) > r) return false
            if (xy_distance(xy, xy_(x, y + height)) > r) return false
            return true
          }
        }
        break

      case 'polygon':
      case 'star':
        const node = this.node
        this.elem.hitTest = (xy) => inPolygon(node.points, xy)
        break
    }
  }
})()
