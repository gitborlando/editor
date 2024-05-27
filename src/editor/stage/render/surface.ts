import { IMatrix, mx_applyToPoints, mx_create } from 'src/editor/math/matrix'
import { xy_, xy_client, xy_minus } from 'src/editor/math/xy'
import { StageViewport } from 'src/editor/stage/viewport'
import { createSignal } from 'src/shared/signal/signal'
import { IXY } from 'src/shared/utils/normal'
import { Elem } from './elem'

export const Surface = new (class {
  inited = createSignal()

  canvas!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D

  elemList: Elem[] = []
  dirtyList = new Set<Elem>()

  beforeRender = createSignal()

  private requested = false
  private matrix!: IMatrix

  setCanvas = (canvas: HTMLCanvasElement) => {
    if (this.inited.value) return

    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!

    this.handleResize()
    this.handleEvents()

    this.inited.dispatch(true)
    this.requestRender()
  }

  requestRender() {
    if (this.requested) return
    this.requested = true

    queueMicrotask(() => {
      this.beforeRender.dispatch()
      this.ctxSaveRestore(() => this.render())
      this.requested = false
    })
  }

  render = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.transform(...this.matrix)

    const traverse = (elem: Elem) => {
      elem.draw(this.ctx)
      elem.children?.forEach(traverse)
    }
    this.elemList.forEach((elem) => {
      this.ctxSaveRestore(() => traverse(elem))
    })
  }

  collectDirty(elem: Elem) {
    this.dirtyList.add(elem)
  }

  ctxSaveRestore(func: (ctx: CanvasRenderingContext2D) => any) {
    this.ctx.save()
    func(this.ctx)
    this.ctx.restore()
  }

  addEvent<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ) {
    if (this.inited.value) {
      this.canvas.addEventListener(type, listener, options)
    } else {
      this.inited.hook(() => this.canvas.addEventListener(type, listener, options))
    }
  }

  removeEvent<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ) {
    this.canvas.removeEventListener(type, listener, options)
  }

  private handleResize = () => {
    StageViewport.bound.hook({ immediately: true }, ({ width, height }) => {
      this.canvas.width = width * devicePixelRatio
      this.canvas.height = height * devicePixelRatio
      this.canvas.style.width = `${width}px`
      this.canvas.style.height = `${height}px`
      this.matrix = mx_create(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    })
    this.requestRender()
  }

  private handleEvents = () => {
    const { x, y } = StageViewport.bound.value
    const canvasXY = xy_(x, y)

    const traverse = (eventXY: IXY, func: (elem: Elem, xy: IXY, capture: boolean) => any) => {
      const _traverse = (elem: Elem, xy: IXY) => {
        func(elem, xy, true)
        elem.children?.forEach((elem) => {
          _traverse(elem, mx_applyToPoints(xy, elem.matrix))
        })
        func(elem, xy, false)
      }
      this.elemList.forEach((elem) => _traverse(elem, eventXY))
    }

    this.addEvent('mousedown', (e) => {
      const eventXY = xy_minus(xy_client(e), canvasXY)
      traverse(eventXY, (elem, xy, capture) => {
        elem.eventHandler.trigger(xy, 'mousedown', capture)
      })
    })
    this.addEvent('mousemove', (e) => {
      const eventXY = xy_minus(xy_client(e), canvasXY)
      traverse(eventXY, (elem, xy, capture) => {
        elem.eventHandler.trigger(xy, 'mousemove', capture)
      })
    })
  }
})()
