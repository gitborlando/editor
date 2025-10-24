import { AABB, OBB } from '@gitborlando/geo'
import { createObjCache, loopFor } from '@gitborlando/utils'
import { FC, ReactNode } from 'react'
import { EditorSetting } from 'src/editor/editor/setting'
import { atan2, degreefy, normalAngle, radianfy } from 'src/editor/math/base'
import { xy_, xy_distance, xy_minus } from 'src/editor/math/xy'
import { Surface } from 'src/editor/stage/render/surface'
import { INoopFunc, IXY } from 'src/shared/utils/normal'

export const ElemReact: FC<ElemProps> = 'elem' as unknown as FC<ElemProps>

export type ElemProps = {
  id?: string
  outline?: 'hover' | 'select'
  hidden?: boolean
  obb?: OBB
  dirtyExpand?: number
  draw?: (ctx: CanvasRenderingContext2D, path2d: Path2D) => void
  hitTest?: (xy: IXY) => boolean
  events?: Partial<Record<ElemEventType, ElemEventFunc>>
  children?: ReactNode[]
}

export class Elem {
  constructor(
    public id = '',
    public type: 'sceneElem' | 'widgetElem',
    parent?: Elem,
  ) {
    if (parent) {
      this.parent = parent
      parent.addChild(this)
    }
  }

  outline?: 'hover' | 'select' | `${number}-${string}`
  clip = false
  hidden = false
  optimize = false
  dirtyExpand = 1

  private _obb = OBB.identityOBB()
  get obb() {
    return this._obb
  }
  set obb(obb: OBB) {
    Surface.collectDirty(this)
    this._obb = obb
    Surface.collectDirty(this)
  }

  get aabb() {
    return this.obb.aabb
  }

  get visible() {
    if (this.hidden) return false
    if (this.type === 'widgetElem') return true
    return Surface.testVisible(this.aabb)
  }

  draw = (ctx: CanvasRenderingContext2D, path2d: Path2D) => {}
  getDirtyRect = (expand: (aabb: AABB, ...expands: number[]) => AABB) =>
    expand(this.aabb, this.dirtyExpand)

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

  traverseDraw = (ctx: CanvasRenderingContext2D, customFunc?: (elem: Elem) => any) => {
    if (!this.visible) return
    if (customFunc?.(this) === false) return

    if (EditorSetting.setting.ignoreUnVisible && this.optimize) {
      const visualSize = Surface.getVisualSize(this.aabb)
      if (visualSize.x < 2 && visualSize.y < 2) return
    }

    Surface.ctxSaveRestore(() => {
      const path2d = new Path2D()
      Surface.ctxSaveRestore(() => this.draw(ctx, path2d))

      if (!this.children.length) return

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
    this.parent?.removeChild(this)
    Surface.collectDirty(this)
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

  private hitTestCache = createObjCache<(xy: IXY) => boolean>()

  cacheHitTest = (createHitTest: () => (xy: IXY) => boolean, deps: any[]) => {
    this.hitTest = this.hitTestCache.getSet('hitTest', createHitTest, deps)
  }

  addEvent = (type: ElemEventType, func: ElemEventFunc, option?: { capture?: boolean }) => {
    const capture = option?.capture ? 0 : 1

    this[type][capture].push(func)
    this.eventCount++

    return () => {
      const index = this[type][capture].indexOf(func)
      if (index === -1) return

      this[type][capture].splice(index, 1)
      this.eventCount--
    }
  }

  removeEvent = (type: ElemEventType, func: ElemEventFunc, option?: { capture?: boolean }) => {
    const capture = option?.capture ? 0 : 1
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
    this.hitTestCache.clear()
  }

  triggerMouseEvent = (
    e: MouseEvent,
    xy: IXY,
    hit: boolean,
    isCapture: boolean,
    stopPropagation: INoopFunc,
  ) => {
    if (this.eventCount === 0) return

    const capture = isCapture ? 0 : 1
    const mouseEvent = {
      xy,
      stopPropagation,
      hostEvent: e as MouseEvent,
    }

    switch (e.type) {
      case 'mousedown':
        if (hit) {
          this.mousedown[capture].forEach((func) => func({ ...mouseEvent, hovered: true }))
        }
        break

      case 'mousemove':
        if (hit) {
          this.mousemove[capture].forEach((func) => func({ ...mouseEvent, hovered: true }))
        }
        if (hit !== this.lastHit[capture]) {
          this.lastHit[capture] = hit
          this.hover[capture].forEach((func) => func({ ...mouseEvent, hovered: hit }))
        }
        break
    }
  }
}

export class ElemHitUtil {
  static HitRoundRect(w: number, h: number, r: number) {
    return (xy: IXY) => {
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
  }

  static HitPolygon(xys: IXY[]) {
    return (xy: IXY) => {
      return this.inPolygon(xys, xy)
    }
  }

  static HitPolyline(xys: IXY[], spread: number) {
    const polygons: IXY[][] = []
    loopFor(xys, (cur, next) => {
      polygons.push(this.twoPointsSpreadRect(cur, next, spread))
    })
    return (xy: IXY) => {
      for (let i = 0; i < polygons.length; i++) {
        if (this.inPolygon(polygons[i], xy)) return true
      }
      return false
    }
  }

  static HitEllipse(
    cx: number,
    cy: number,
    a: number,
    b: number,
    startAngle: number,
    endAngle: number,
    innerRate: number,
  ) {
    return (xy: IXY) => {
      const dx = xy.x - cx
      const dy = xy.y - cy

      const hit = (a: number, b: number) =>
        (dx * dx * a * b) / (a * a) + (dy * dy * a * b) / (b * b) <= a * b

      const hitOuter = hit(a, b)
      if (!hitOuter) return false

      if (innerRate) {
        const hitInner = hit(a * innerRate, b * innerRate)
        if (hitInner) return false
      }

      startAngle = normalAngle(startAngle)
      endAngle = normalAngle(endAngle)

      if (startAngle === 0 && endAngle === 0) return true

      const angle = normalAngle(degreefy(atan2(dy, dx)))

      if (startAngle <= endAngle) {
        return angle >= startAngle && angle <= endAngle
      } else {
        return angle >= startAngle || angle <= endAngle
      }
    }
  }

  static HitPoint(center: IXY, size: number) {
    return (xy: IXY) => {
      return this.HitEllipse(center.x, center.y, size / 2, size / 2, 0, 360, 0)(xy)
    }
  }

  private static inPolygon(xys: IXY[], xy: IXY) {
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

  private static twoPointsSpreadRect(p1: IXY, p2: IXY, spread: number) {
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
