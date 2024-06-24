import autoBind from 'class-autobind-decorator'
import { getEditorSetting } from 'src/editor/editor/editor'
import { round } from 'src/editor/math/base'
import {
  IMatrix,
  mx_applyAABB,
  mx_create,
  mx_invertAABB,
  mx_invertPoint,
} from 'src/editor/math/matrix'
import { AABB, OBB } from 'src/editor/math/obb'
import { xy_, xy_client, xy_minus, xy_rotate, xy_toArray } from 'src/editor/math/xy'
import { TextBreaker, createTextBreaker } from 'src/editor/stage/render/text-break/text-breaker'
import { StageViewport, getZoom } from 'src/editor/stage/viewport'
import { createSignal, multiSignal } from 'src/shared/signal/signal'
import { reverseFor } from 'src/shared/utils/array'
import { INoopFunc, IXY, Raf, dpr, getTime } from 'src/shared/utils/normal'
import TinyQueue from 'tinyqueue'
import { Elem } from './elem'

@autoBind
export class StageSurface {
  inited$ = createSignal()
  layerList: Elem[] = []

  textBreaker!: TextBreaker

  private canvas!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D

  private bufferCanvas = new OffscreenCanvas(0, 0)
  private bufferCtx = this.bufferCanvas.getContext('2d')!

  setCanvas = async (canvas: HTMLCanvasElement) => {
    if (this.inited$.value) return

    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.textBreaker = await createTextBreaker()

    this.handleResize()
    this.handleViewport()
    this.handleEvents()

    this.inited$.dispatch(true)
  }

  setCursor = (cursor: string) => {
    this.canvas.style.cursor = cursor
  }

  clearSurface = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  ctxSaveRestore(func: (ctx: CanvasRenderingContext2D) => any) {
    this.ctx.save()
    func(this.ctx)
    this.ctx.restore()
  }

  private renderTasks: INoopFunc[] = []
  private raf = new Raf()

  private requestRender = (type: 'firstFullRender' | 'nextFullRender' | 'partialRender') => {
    if (type === 'partialRender' && this.renderTasks.length) return

    if (type === 'firstFullRender') this.calcFullRenderElemsMinHeap()
    if (type !== 'nextFullRender') this.renderTasks.length = 0

    this.renderTasks.push(() => {
      if (type === 'firstFullRender') this.clearSurface()
      if (type === 'partialRender') this.partialRender()
      else this.fullRender()
    })

    this.raf.cancelAll().request((next) => {
      this.ctxSaveRestore(() => this.renderTasks.pop()?.())
      this.renderTasks.length && next()
    })
  }

  private fullRenderElemsMinHeap: TinyQueue<{ elem: Elem; selfIndex: number; layerIndex: number }> =
    new TinyQueue()

  private calcFullRenderElemsMinHeap() {
    this.fullRenderElemsMinHeap = new TinyQueue(undefined, (a, b) => {
      if (a.layerIndex === b.layerIndex) return a.selfIndex - b.selfIndex
      return a.layerIndex - b.layerIndex
    })
    this.layerList.forEach((elem, layerIndex) =>
      elem.children.forEach((elem, selfIndex) => {
        if (!elem.visible) return
        this.fullRenderElemsMinHeap.push({ elem, selfIndex, layerIndex })
      })
    )
  }

  private fullRender = () => {
    this.ctx.transform(...this.dprMatrix)
    this.ctx.transform(...this.viewportMatrix)

    if (!getEditorSetting('needSliceRender')) {
      this.layerList.forEach((elem) => elem.traverseDraw(this.ctx))
      return
    }

    if (!this.fullRenderElemsMinHeap.length) return

    const startTime = getTime()
    while (getTime() - startTime <= 4) {
      const elem = this.fullRenderElemsMinHeap.pop()?.elem
      elem?.traverseDraw(this.ctx)
    }

    this.requestRender('nextFullRender')
  }

  private patchRender = (reRenderElems: Set<Elem>) => {
    this.ctx.transform(...this.dprMatrix)
    this.ctx.transform(...this.viewportMatrix)

    this.layerList.forEach((elem) => {
      elem.children.forEach((elem) => {
        reRenderElems.has(elem) && elem.traverseDraw(this.ctx)
      })
    })
  }

  private translate = (cur: IXY, prev: IXY) => {
    const { width, height } = this.canvas
    const [tx, ty] = xy_toArray(xy_minus(cur, prev))
    const reRenderElems = new Set<Elem>()

    const traverse = (elem: Elem) => {
      if (!elem.visible) return
      if (AABB.Include(this.prevViewportAABB, elem.aabb) === 1) return
      reRenderElems.add(elem)
    }

    this.bufferCtx.clearRect(0, 0, width, height)
    this.bufferCtx.setTransform(1, 0, 0, 1, round(tx * dpr), round(ty * dpr))
    this.bufferCtx.drawImage(this.canvas, 0, 0, width, height, 0, 0, width, height)

    this.ctx.clearRect(0, 0, width, height)
    this.ctx.drawImage(this.bufferCanvas, 0, 0, width, height, 0, 0, width, height)

    this.layerList.forEach((elem) => elem.children.forEach(traverse))
    this.ctxSaveRestore(() => this.patchRender(reRenderElems))
  }

  private dirtyRects = new Set<AABB>()

  collectDirty = (elem: Elem) => {
    const expand = (aabb: AABB, ...expands: number[]) =>
      AABB.Expand(
        aabb,
        ...(expands.map((i) => i / getZoom()) as [number] | [number, number, number, number])
      )
    this.dirtyRects.add(elem.getDirtyRect(expand))
    this.requestRender('partialRender')
  }

  private partialRender = () => {
    const reRenderElems = new Set<Elem>()
    let dirtyArea = AABB.Merge([...this.dirtyRects])
    let needReTest = true

    const traverse = (elem: Elem) => {
      if (!elem.visible) return
      if (!AABB.Collide(dirtyArea, elem.aabb)) return

      if (AABB.Include(dirtyArea, elem.aabb) !== 1) {
        dirtyArea = AABB.Merge([dirtyArea, elem.aabb])
        needReTest = true
      }
      reRenderElems.add(elem)
      elem.children.forEach(traverse)
    }

    while (needReTest) {
      needReTest = false
      reRenderElems.clear()
      this.layerList.forEach((elem) => elem.children.forEach(traverse))
    }

    dirtyArea = mx_applyAABB(dirtyArea, this.viewportMatrix)
    dirtyArea = mx_applyAABB(dirtyArea, this.dprMatrix)
    const { minX, minY, maxX, maxY } = dirtyArea
    this.ctx.clearRect(minX, minY, maxX - minX, maxY - minY)
    this.dirtyRects.clear()

    this.patchRender(reRenderElems)
  }

  private dprMatrix = mx_create(dpr, 0, 0, dpr, 0, 0)
  private boundAABB!: AABB
  private viewportMatrix!: IMatrix
  private prevViewportMatrix!: IMatrix
  private viewportAABB!: AABB
  private prevViewportAABB!: AABB

  private handleViewport = () => {
    const viewportSignal = multiSignal(StageViewport.zoom$, StageViewport.offset$)
    viewportSignal.hook({ immediately: true }, () => {
      const { zoom, x, y } = StageViewport.getViewport()
      this.prevViewportMatrix = this.viewportMatrix || mx_create(zoom, 0, 0, zoom, x, y)
      this.viewportMatrix = mx_create(zoom, 0, 0, zoom, x, y)
      this.prevViewportAABB = mx_invertAABB(this.boundAABB, this.prevViewportMatrix)
      this.viewportAABB = mx_invertAABB(this.boundAABB, this.viewportMatrix)
      this.layerList.forEach((elem) => (elem.obb = OBB.FromAABB(this.viewportAABB)))
    })

    StageViewport.zoomingStage$.hook(() => {
      this.requestRender('firstFullRender')
    })

    StageViewport.movingStage$.hook((value, oldValue) => {
      this.translate(value, oldValue)
    })
  }

  private handleResize = () => {
    StageViewport.bound.hook({ immediately: true }, ({ width, height }) => {
      this.canvas.width = this.bufferCanvas.width = width * dpr
      this.canvas.height = this.bufferCanvas.height = height * dpr
      this.canvas.style.width = `${width}px`
      this.canvas.style.height = `${height}px`
      this.boundAABB = new AABB(0, 0, width, height)
    })

    StageViewport.bound.hook(() => {
      this.requestRender('firstFullRender')
    })
  }

  testVisible = (aabb: AABB) => {
    return AABB.Collide(aabb, this.viewportAABB)
  }

  getVisualSize = (aabb: AABB) => {
    const zoom = getZoom()
    return xy_((aabb.maxX - aabb.minX) * zoom, (aabb.maxY - aabb.minY) * zoom)
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

  private eventXY!: IXY

  private getEventXY = (e: MouseEvent) => {
    const bound = StageViewport.bound.value
    const xy = xy_minus(xy_client(e), bound)
    this.eventXY = mx_invertPoint(xy, this.viewportMatrix)
  }

  private traverseLayerList = (
    func: (
      elem: Elem,
      capture: boolean,
      stopped: boolean,
      stopPropagation: INoopFunc,
      hitList?: Elem[],
      xy?: IXY,
      parentHit?: boolean
    ) => any,
    noBubble?: boolean
  ) => {
    let stopped = false
    const stopPropagation = () => (stopped = true)

    const traverse = (layerIndex: number, elem: Elem, hitList?: Elem[]) => {
      if (!elem.visible) return

      if (this.eventXY) {
        let xy = xy_rotate(this.eventXY, elem.obb.xy, -elem.obb.rotation)
        xy = xy_minus(xy, elem.obb.xy)

        func(elem, true, stopped, stopPropagation, hitList!, xy)

        const subHitList: Elem[] = []
        reverseFor(elem.children, (elem) => traverse(layerIndex, elem, subHitList))
        subHitList.forEach((i) => this.elemsFromPoint[layerIndex].push(i))

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
    const onMouseEvent = (e: MouseEvent) => {
      this.elemsFromPoint = this.layerList.map(() => [])
      this.getEventXY(e)

      if (this.isPointerEventNone) return

      this.traverseLayerList((elem, capture, stopped, stopPropagation, hitList, xy) => {
        const hit = elem.hitTest(xy!)
        if (hit) hitList?.push(elem)
        if (!stopped) elem.eventHandle.triggerMouseEvent(e, xy!, hit, capture, stopPropagation)
      })
    }
    this.addEvent('mousedown', onMouseEvent, { capture: true })
    this.addEvent('mousemove', onMouseEvent, { capture: true })
  }

  private isPointerEventNone = false

  setPointerEvent(option: { pointerEventNone: boolean; cancelOnPointerUp?: boolean }) {
    this.isPointerEventNone = option.pointerEventNone

    if (option.cancelOnPointerUp !== false) {
      window.addEventListener('pointerup', () => {
        this.isPointerEventNone = false
      })
    }
  }
}

export const Surface = new StageSurface()

export function logId(elems: Elem[] | Set<Elem>) {
  console.log([...elems].map((elem) => elem.id))
}
