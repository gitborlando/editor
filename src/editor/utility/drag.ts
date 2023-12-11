import { makeObservable, observable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { autobind } from '~/shared/decorator'
import { IBound, IXY, makeAction, noopFunc, type ICursor } from '../../shared/utils'

export type IDragData = {
  dragService: DragService
  current: IXY
  start: IXY
  shift: IXY
  marquee: IBound
}

@autobind
@injectable()
export class DragService {
  @observable canMove = false
  @observable cursor: ICursor = 'auto'
  private current = { x: 0, y: 0 }
  private start = { x: 0, y: 0 }
  private shift = { x: 0, y: 0 }
  private marquee = { x: 0, y: 0, width: 0, height: 0 }
  private startHandler?: (this: Window, event: MouseEvent) => any
  private moveHandler?: (this: Window, event: MouseEvent) => any
  private endHandler?: (this: Window, event: MouseEvent) => any
  constructor() {
    makeObservable(this)
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
        makeAction(callback)?.({
          dragService: this,
          current: this.current,
          start: this.start,
          shift: this.shift,
          marquee: this.marquee,
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
        makeAction(callback)({
          dragService: this,
          current: this.current,
          start: this.start,
          shift: this.shift,
          marquee: this.marquee,
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
        makeAction(callback)?.({
          dragService: this,
          current: this.current,
          start: this.start,
          shift: this.shift,
          marquee: this.marquee,
        })
        this.setDataToDefault()
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
    this.setDataToDefault()
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
  private setDataToDefault() {
    this.canMove = false
    this.current = { x: 0, y: 0 }
    this.start = { x: 0, y: 0 }
    this.shift = { x: 0, y: 0 }
    this.marquee = { x: 0, y: 0, width: 0, height: 0 }
  }
}

export const injectDrag = inject(DragService)
