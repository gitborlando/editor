import { IMatrix } from 'src/editor/math/matrix'
import { OBB2 } from 'src/editor/math/obb2'
import { IPoint } from 'src/editor/schema/type'
import { IXY } from 'src/shared/utils/normal'

export type ElemType = 'text' | 'rect' | 'polygon' | 'circle' | 'irregular'

export class Elem {
  id = ''
  type: ElemType = 'rect'

  matrix?: IMatrix
  obb: OBB2 = new OBB2(0, 0, 0, 0, 0)

  points: IPoint[] = []
  draw = (ctx: CanvasRenderingContext2D) => {}

  parent!: Elem
  children: Elem[] = []

  insertBefore(elem: Elem, refElem?: Elem) {
    const elemIndex = this.children.indexOf(elem)
    const refIndex = this.children.indexOf(refElem!)
    if (elemIndex !== -1) this.children.splice(elemIndex, 1)
    this.children.splice(refIndex, 0, elem)
    elem.parent = this
  }

  addChild(elem: Elem) {
    elem.parent = this
    this.children.push(elem)
  }

  removeChild(elem: Elem) {
    const index = this.children.indexOf(elem)
    if (index !== -1) this.children.splice(index, 1)
  }

  eventHandler = new ElemEventHandler(this)

  get hitTest() {
    return this.eventHandler.hitTest
  }
  set hitTest(test: (xy: IXY) => boolean) {
    this.eventHandler.hitTest = test
  }

  addEvent(type: ElemEventType, func: ElemEventFunc, option?: { capture?: boolean }) {
    return this.eventHandler.addEvent(type, func, option)
  }
}

export type ElemEventType = 'mousedown' | 'hover'

export type ElemEvent = {
  xy: IXY
  hovered: boolean
}

export type ElemEventFunc = (e: ElemEvent) => void

class ElemEventHandler {
  hitTest = (xy: IXY) => false
  private lastHit = false

  private mousedown: ElemEventFunc[][] = [[], []]
  private hover: ElemEventFunc[][] = [[], []]
  private eventCount = 0

  constructor(private elem: Elem) {}

  addEvent(type: ElemEventType, func: ElemEventFunc, option?: { capture?: boolean }) {
    const { capture = false } = option || {}

    this[type][Number(capture)].push(func)
    this.eventCount++

    return () => {
      this[type].splice(this[type][Number(capture)].indexOf(func), 1)
      this.eventCount--
    }
  }

  trigger(xy: IXY, htmlEventType: 'mousedown' | 'mousemove', capture = false) {
    if (this.eventCount === 0) return

    const hit = this.hitTest(xy)
    console.log('hit: ', hit, this.lastHit, this.elem.id)

    switch (htmlEventType) {
      case 'mousedown':
        if (hit) {
          this.mousedown[Number(capture)].forEach((func) => func({ xy, hovered: true }))
        }
        break
      case 'mousemove':
        if (hit !== this.lastHit) {
          this.lastHit = hit
          this.hover[Number(capture)].forEach((func) => func({ xy, hovered: hit }))
        }
        break
    }
  }
}
