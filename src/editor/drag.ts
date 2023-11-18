import autoBind from 'auto-bind'
import { makeObservable } from 'mobx'
import { noopFunc } from '~/helper/utils'
import { EditorService } from './editor'
import { ICursor } from './utils'

export type IPoint = { x: number; y: number }
export type IMarquee = { x: number; y: number; width: number; height: number }

type IDragData = {
  drag: DragService
  current: IPoint
  start: IPoint
  shift: IPoint
  marquee: IMarquee
  absoluteCurrent: IPoint
  absoluteStart: IPoint
  absoluteShift: IPoint
  absoluteMarquee: IMarquee
}

export class DragService {
  canMove = false
  cursor: ICursor = 'auto'
  private current = { x: 0, y: 0 }
  private start = { x: 0, y: 0 }
  private shift = { x: 0, y: 0 }
  private marquee = { x: 0, y: 0, width: 0, height: 0 }
  private startHandler?: (this: Window, event: MouseEvent) => any
  private moveHandler?: (this: Window, event: MouseEvent) => any
  private endHandler?: (this: Window, event: MouseEvent) => any
  constructor(private editor: EditorService) {
    autoBind(this)
    makeObservable(this, { canMove: true })
  }
  onStart(callback?: (data: IDragData) => void) {
    if (this.startHandler) return this
    window.addEventListener(
      'mousedown',
      (this.startHandler = ({ clientX, clientY }) => {
        this.current = { x: clientX, y: clientY }
        this.start = { x: clientX, y: clientY }
        this.marquee = this.calculateMarquee()
        this.canMove = true
        callback?.({
          drag: this,
          current: this.current,
          start: this.start,
          shift: this.shift,
          marquee: this.marquee,
          absoluteCurrent: this.editor.stage.absoluteXY(this.stagefy(this.current)),
          absoluteStart: this.editor.stage.absoluteXY(this.stagefy(this.start)),
          absoluteShift: this.editor.stage.absoluteShift(this.shift),
          absoluteMarquee: this.absoluteMarquee(),
        })
      })
    )
    return this
  }
  onMove(callback: (data: IDragData) => void) {
    if (this.moveHandler) return this
    window.addEventListener(
      'mousemove',
      (this.moveHandler = ({ clientX, clientY }) => {
        if (!this.canMove) return
        this.canMove = true
        this.current = { x: clientX, y: clientY }
        this.shift = {
          x: this.current.x - this.start.x,
          y: this.current.y - this.start.y,
        }
        this.marquee = this.calculateMarquee()
        callback({
          drag: this,
          current: this.current,
          start: this.start,
          shift: this.shift,
          marquee: this.marquee,
          absoluteCurrent: this.editor.stage.absoluteXY(this.stagefy(this.current)),
          absoluteStart: this.editor.stage.absoluteXY(this.stagefy(this.start)),
          absoluteShift: this.editor.stage.absoluteShift(this.shift),
          absoluteMarquee: this.absoluteMarquee(),
        })
      })
    )
    return this
  }
  onEnd(callback?: (data: IDragData) => void) {
    if (this.endHandler) return this
    window.addEventListener(
      'mouseup',
      (this.endHandler = () => {
        if (!this.canMove) return
        this.marquee = this.calculateMarquee()
        callback?.({
          drag: this,
          current: this.current,
          start: this.start,
          shift: this.shift,
          marquee: this.marquee,
          absoluteCurrent: this.editor.stage.absoluteXY(this.stagefy(this.current)),
          absoluteStart: this.editor.stage.absoluteXY(this.stagefy(this.start)),
          absoluteShift: this.editor.stage.absoluteShift(this.shift),
          absoluteMarquee: this.absoluteMarquee(),
        })
        this.canMove = false
        this.current = { x: 0, y: 0 }
        this.start = { x: 0, y: 0 }
        this.shift = { x: 0, y: 0 }
        this.marquee = { x: 0, y: 0, width: 0, height: 0 }
      })
    )
    return this
  }
  onSlide(callback: (data: IDragData) => void) {
    this.onStart()
      .onMove(callback)
      .onEnd(() => this.destroy())
    return this
  }
  destroy() {
    window.removeEventListener('mousedown', this.startHandler || noopFunc)
    window.removeEventListener('mousemove', this.moveHandler || noopFunc)
    window.removeEventListener('mouseup', this.endHandler || noopFunc)
    this.startHandler = undefined
    this.moveHandler = undefined
    this.endHandler = undefined
  }
  setCursor(cursor: ICursor) {
    this.cursor = cursor
    return this
  }
  private calculateMarquee() {
    this.marquee = { x: this.start.x, y: this.start.y, width: 0, height: 0 }
    if (this.shift.x >= 0) {
      if (this.shift.y >= 0) {
        this.marquee.width = this.shift.x
        this.marquee.height = this.shift.y
      } else {
        this.marquee.y = this.start.y + this.shift.y
        this.marquee.width = this.shift.x
        this.marquee.height = -this.shift.y
      }
    } else {
      if (this.shift.y >= 0) {
        this.marquee.x = this.start.x + this.shift.x
        this.marquee.width = -this.shift.x
        this.marquee.height = this.shift.y
      } else {
        this.marquee.x = this.start.x + this.shift.x
        this.marquee.y = this.start.y + this.shift.y
        this.marquee.width = -this.shift.x
        this.marquee.height = -this.shift.y
      }
    }
    return this.marquee
  }
  private stagefy({ x, y }: { x: number; y: number }) {
    return { x: x - this.editor.stage.bound.left, y: y - this.editor.stage.bound.top }
  }
  private absoluteMarquee() {
    const { x, y } = this.editor.stage.absoluteXY(
      this.stagefy({ x: this.marquee.x, y: this.marquee.y })
    )
    const { x: width, y: height } = this.editor.stage.absoluteShift({
      x: this.marquee.width,
      y: this.marquee.height,
    })
    const absoluteMarquee = { x, y, width, height }
    return absoluteMarquee
  }
}
