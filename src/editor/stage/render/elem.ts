import { radianfy } from 'src/editor/math/base'
import { OBB } from 'src/editor/math/obb'
import { xy_, xy_distance, xy_minus } from 'src/editor/math/xy'
import { Surface } from 'src/editor/stage/render/surface'
import { loopFor } from 'src/shared/utils/array'
import { INoopFunc, IXY } from 'src/shared/utils/normal'

export class Elem {
  constructor(public id = '') {}

  outline?: 'hover' | 'select'
  clip = false
  hidden = false

  obb = OBB.IdentityOBB()
  get aabb() {
    return this.obb.aabb
  }

  dirty = true
  draw = (ctx: CanvasRenderingContext2D, path2d: Path2D) => {}

  setMatrix = (ctx: CanvasRenderingContext2D, inverse = false) => {
    const { x, y, rotation } = this.obb
    if (!inverse) {
      ctx.translate(x, y)
      ctx.rotate(radianfy(rotation))
    } else {
      ctx.rotate(-radianfy(rotation))
      ctx.translate(-x, -y)
    }
  }

  traverseDraw = (ctx: CanvasRenderingContext2D) => {
    if (this.hidden) return

    const path2d = new Path2D()

    Surface.ctxSaveRestore(() => {
      this.draw(ctx, path2d)

      if (this.clip) {
        this.setMatrix(ctx)
        ctx.clip(path2d)
        this.setMatrix(ctx, true)
      }

      this.children.forEach((child) => child.traverseDraw(ctx))
    })
  }

  parent!: Elem
  children: Elem[] = []

  addChild(elem: Elem) {
    elem.parent = this
    this.children.push(elem)
  }

  removeChild(elem: Elem) {
    const index = this.children.indexOf(elem)
    if (index !== -1) this.children.splice(index, 1)
  }

  eventHandle = new ElemEventHandler(this)

  get hitTest() {
    return this.eventHandle.hitTest
  }
  set hitTest(hitTest: (xy: IXY) => boolean) {
    this.eventHandle.hitTest = hitTest
  }

  addEvent(type: ElemEventType, func: ElemEventFunc, option?: { capture?: boolean }) {
    return this.eventHandle.addEvent(type, func, option)
  }

  removeEvent(type: ElemEventType, func: ElemEventFunc, option?: { capture?: boolean }) {
    return this.eventHandle.removeEvent(type, func, option)
  }

  destroy() {
    this.eventHandle.dispose()
    this.parent.removeChild(this)
  }
}

export type ElemEventType = 'mousedown' | 'mousemove' | 'hover'

type ElemEventBase = {
  hostEvent: Event
  stopPropagation: () => void
}

export type ElemEvent = ElemMouseEvent

export type ElemMouseEvent = ElemEventBase & {
  xy: IXY
  hovered: boolean
  hostEvent: MouseEvent
}

export type ElemEventFunc = (e: ElemMouseEvent) => void

class ElemEventHandler {
  hitTest = (xy: IXY) => false
  private lastHit = [false, false]

  private mousedown: ElemEventFunc[][] = [[], []]
  private mousemove: ElemEventFunc[][] = [[], []]
  private hover: ElemEventFunc[][] = [[], []]
  private eventCount = 0

  constructor(private elem: Elem) {}

  addEvent(type: ElemEventType, func: ElemEventFunc, option?: { capture?: boolean }) {
    const capture = Number(option?.capture || false)

    this[type][capture].push(func)
    this.eventCount++

    return () => {
      const index = this[type][capture].indexOf(func)
      if (index === -1) return

      this[type][capture].splice(index, 1)
      this.eventCount--
    }
  }

  removeEvent(type: ElemEventType, func: ElemEventFunc, option?: { capture?: boolean }) {
    const capture = Number(option?.capture || false)
    const index = this[type][capture].indexOf(func)
    if (index === -1) return

    this[type][capture].splice(index, 1)
    this.eventCount--
  }

  dispose() {
    this.mousedown = [[], []]
    this.mousemove = [[], []]
    this.hover = [[], []]
    this.eventCount = 0
  }

  triggerMouseEvent(
    e: MouseEvent,
    xy: IXY,
    hit: boolean,
    isCapture: boolean,
    stopPropagation: INoopFunc
  ) {
    if (this.eventCount === 0) return

    const capture = Number(isCapture)
    const mouseEvent = {
      xy,
      stopPropagation,
      hostEvent: e as MouseEvent,
    }

    switch (e.type) {
      case 'mousedown':
        if (hit) {
          this.mousedown[capture].forEach((func) => {
            func({ ...mouseEvent, hovered: true })
          })
        }
        break

      case 'mousemove':
        if (hit) {
          this.mousemove[capture].forEach((func) => {
            func({ ...mouseEvent, hovered: true })
          })
        }
        if (hit !== this.lastHit[capture]) {
          this.lastHit[capture] = hit
          this.hover[capture].forEach((func) => {
            func({ ...mouseEvent, hovered: hit })
          })
        }
        break
    }
  }

  hitRoundRect(w: number, h: number, r: number) {
    return (xy: IXY) => {
      return this.inRoundRect(xy, w, h, r)
    }
  }

  hitPolygon(xys: IXY[]) {
    return (xy: IXY) => {
      return this.inPolygon(xys, xy)
    }
  }

  hitPolyline(xys: IXY[], spread: number) {
    return (xy: IXY) => {
      return this.inPolyline(xys, xy, spread)
    }
  }

  hitEllipse(cx: number, cy: number, a: number, b: number) {
    return (xy: IXY) => {
      return this.inEllipse(xy, cx, cy, a, b)
    }
  }

  hitPoint(center: IXY, size: number) {
    return (xy: IXY) => {
      return this.hitEllipse(center.x, center.y, size / 2, size / 2)(xy)
    }
  }

  private inRoundRect(xy: IXY, w: number, h: number, r: number) {
    const inRect = xy.x >= 0 && xy.x <= w && xy.y >= 0 && xy.y <= h
    if (r === 0) {
      return inRect
    } else {
      if (!inRect) return false
      if (xy_distance(xy, xy_(r, r)) > r && xy.x < r && xy.y < r) return false
      if (xy_distance(xy, xy_(w - r, r)) > r && xy.x > w - r && xy.y < r) return false
      if (xy_distance(xy, xy_(w - r, h - r)) > r && xy.x > w - r && xy.y > h - r) return false
      if (xy_distance(xy, xy_(r, h - r)) > r && xy.x < r && xy.y > h - r) return false
      return true
    }
  }

  private inEllipse(xy: IXY, cx: number, cy: number, a: number, b: number) {
    const dx = xy.x - cx
    const dy = xy.y - cy
    return (dx * dx * a * b) / (a * a) + (dy * dy * a * b) / (b * b) <= a * b
  }

  private inPolygon(xys: IXY[], xy: IXY) {
    let inside = false
    loopFor(xys, (cur, next) => {
      if (cur.y > xy.y && next.y > xy.y) return
      if (cur.y < xy.y && next.y < xy.y) return
      const small = cur.y < next.y ? cur : next
      const large = cur.y > next.y ? cur : next
      const A = xy_minus(large, small)
      const B = xy_minus(xy, small)
      if (A.x * B.y - A.y * B.x > 0) inside = !inside
    })
    return inside
  }

  private inPolyline(xys: IXY[], xy: IXY, spread: number) {
    let isCollide = false
    loopFor(xys, (cur, next) => {
      const fourVertex = this.twoPointsSpreadRect(cur, next, spread)
      if (this.inPolygon(fourVertex, xy)) {
        return (isCollide = true)
      }
    })
    return isCollide
  }

  private twoPointsSpreadRect(p1: IXY, p2: IXY, spread: number) {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const radian = Math.atan2(dy, dx)
    const xShift = spread * Math.sin(radian)
    const yShift = spread * Math.cos(radian)
    const TL = xy_(p1.x - xShift, p1.y + yShift)
    const TR = xy_(p2.x - xShift, p2.y + yShift)
    const BR = xy_(p2.x + xShift, p2.y - yShift)
    const BL = xy_(p1.x + xShift, p1.y - yShift)
    return [TL, TR, BR, BL]
  }
}
