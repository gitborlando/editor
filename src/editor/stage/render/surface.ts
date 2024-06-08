import { IMatrix, mx_applyToAABB, mx_create, mx_invertToPoint } from 'src/editor/math/matrix'
import { AABB } from 'src/editor/math/obb'
import { xy_client, xy_minus, xy_rotate } from 'src/editor/math/xy'
import { TextBreaker, createTextBreaker } from 'src/editor/stage/render/text-break/text-breaker'
import { StageViewport, getZoom } from 'src/editor/stage/viewport'
import { createSignal, multiSignal } from 'src/shared/signal/signal'
import { reverseFor } from 'src/shared/utils/array'
import { INoopFunc, IXY } from 'src/shared/utils/normal'
import { Elem } from './elem'

export const Surface = new (class SurfaceService {
  inited$ = createSignal()

  canvas!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D

  textBreaker!: TextBreaker

  setCanvas = async (canvas: HTMLCanvasElement) => {
    if (this.inited$.value) return

    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!

    this.textBreaker = await createTextBreaker()

    this.handleViewport()
    this.handleResize()
    this.handleEvents()

    this.requestRender('full')
    this.inited$.dispatch(true)
  }

  ctxSaveRestore(func: (ctx: CanvasRenderingContext2D) => any) {
    this.ctx.save()
    func(this.ctx)
    this.ctx.restore()
  }

  layerList: Elem[] = []
  private renderType?: 'full' | 'partial'

  requestRender(type: 'full' | 'partial') {
    if (this.renderType !== undefined && type !== 'full') return
    this.renderType = type

    requestAnimationFrame(() => {
      this.ctxSaveRestore(() => {
        type === 'full' ? this.fullRender() : this.partialRender()
      })
      this.dirtyRects.clear()
      this.renderType = undefined
    })
  }

  private fullRender = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.transform(...this.dprMatrix)
    this.ctx.transform(...this.viewportMatrix)

    this.layerList.forEach((elem) => elem.traverseDraw(this.ctx))
  }

  private dirtyRects = new Set<AABB>()

  collectDirtyRect = (aabb: AABB, expand = 1) => {
    if (this.renderType === 'full') return

    this.dirtyRects.add(AABB.Expand(aabb, expand / getZoom()))
    this.requestRender('partial')
  }

  private partialRender = () => {
    const reRenderElems = new Set<Elem>()
    let dirtyArea = AABB.Merge(...this.dirtyRects)
    let needReTest = true

    const traverse = (elem: Elem, ancestor: Elem) => {
      if (elem.hidden) return
      if (AABB.Collide(dirtyArea, elem.obb.aabb)) {
        reRenderElems.add(ancestor)
        if (AABB.Include(dirtyArea, elem.obb.aabb) !== 1) {
          dirtyArea = AABB.Merge(dirtyArea, elem.obb.aabb)
          needReTest = true
        }
      }
      elem.children.forEach((elem) => traverse(elem, ancestor))
    }

    while (needReTest) {
      needReTest = false
      this.layerList.forEach((elem) => {
        elem.children.forEach((elem) => traverse(elem, elem))
      })
    }

    dirtyArea = mx_applyToAABB(dirtyArea, this.viewportMatrix)
    dirtyArea = mx_applyToAABB(dirtyArea, this.dprMatrix)
    const { minX, minY, maxX, maxY } = dirtyArea
    this.ctx.clearRect(minX, minY, maxX - minX, maxY - minY)

    this.ctx.transform(...this.dprMatrix)
    this.ctx.transform(...this.viewportMatrix)

    reRenderElems.forEach((elem) => elem.traverseDraw(this.ctx))
  }

  addEvent = <K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ) => {
    if (this.inited$.value) {
      this.canvas.addEventListener(type, listener, options)
    } else {
      this.inited$.hook(() => this.canvas.addEventListener(type, listener, options))
    }
  }

  removeEvent<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ) {
    this.canvas.removeEventListener(type, listener, options)
  }

  private dprMatrix!: IMatrix
  private viewportMatrix!: IMatrix

  private handleViewport() {
    multiSignal(StageViewport.zoom, StageViewport.stageOffset).hook({ immediately: true }, () => {
      const { zoom, x, y } = StageViewport.getViewport()
      this.dprMatrix = mx_create(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
      this.viewportMatrix = mx_create(zoom, 0, 0, zoom, x, y)
      this.requestRender('full')
    })
  }

  private handleResize = () => {
    StageViewport.bound.hook({ immediately: true }, ({ width, height }) => {
      this.canvas.width = width * devicePixelRatio
      this.canvas.height = height * devicePixelRatio
      this.canvas.style.width = `${width}px`
      this.canvas.style.height = `${height}px`
      this.requestRender('full')
    })
  }

  private getEventXY = (e: MouseEvent) => {
    const bound = StageViewport.bound.value
    const eventXY = xy_minus(xy_client(e), bound)
    return mx_invertToPoint(eventXY, this.viewportMatrix)
  }

  private traverseLayerList = (
    func: (
      elem: Elem,
      capture: boolean,
      stopped: boolean,
      stopPropagation: INoopFunc,
      hitList?: Elem[],
      xy?: IXY
    ) => any,
    eventXY?: IXY,
    noBubble?: boolean
  ) => {
    let stopped = false
    const stopPropagation = () => (stopped = true)

    const traverse = (layerIndex: number, elem: Elem, hitList?: Elem[]) => {
      if (elem.hidden) return

      if (eventXY) {
        let xy = xy_rotate(eventXY, elem.obb.xy, -elem.obb.rotation)
        xy = xy_minus(xy, elem.obb.xy)

        func(elem, true, stopped, stopPropagation, hitList!, xy)

        const subHitList: Elem[] = []
        reverseFor(elem.children, (elem) => traverse(layerIndex, elem, subHitList))
        this.elemsFromPoint[layerIndex].push(...subHitList.reverse())

        !noBubble && func(elem, false, stopped, stopPropagation, undefined, xy)
      } else {
        func(elem, true, stopped, stopPropagation)

        reverseFor(elem.children, (elem) => traverse(layerIndex, elem))
        !noBubble && func(elem, false, stopped, stopPropagation)
      }
    }

    reverseFor(this.layerList, (elem, i) => traverse(i, elem, []))
  }

  elemsFromPoint: Elem[][] = []

  private handleEvents = () => {
    this.addEvent(
      'mousedown',
      (e) => {
        this.elemsFromPoint = this.layerList.map(() => [])

        this.traverseLayerList((elem, capture, stopped, stopPropagation, hitList, xy) => {
          const hit = elem.hitTest(xy!)
          if (hit) hitList?.push(elem)
          if (!stopped) {
            elem.eventHandle.triggerMouseEvent(e, xy!, hit, capture, stopPropagation)
          }
        }, this.getEventXY(e))
      },
      { capture: true }
    )

    this.addEvent(
      'mousemove',
      (e) => {
        this.elemsFromPoint = this.layerList.map(() => [])

        this.traverseLayerList((elem, capture, stopped, stopPropagation, hitList, xy) => {
          const hit = elem.hitTest(xy!)
          if (hit) hitList?.unshift(elem)
          if (!stopped) {
            elem.eventHandle.triggerMouseEvent(e, xy!, hit, capture, stopPropagation)
          }
        }, this.getEventXY(e))
      },
      { capture: true }
    )
  }
})()
