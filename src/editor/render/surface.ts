import { AABB, Angle, OBB, abs, max, round } from '@gitborlando/geo'
import { reverseFor } from '@gitborlando/utils'
import { listen } from '@gitborlando/utils/browser'
import autoBind from 'class-autobind-decorator'
import { getEditorSetting } from 'src/editor/editor/setting'
import { Matrix } from 'src/editor/math/matrix'
import { StageScene } from 'src/editor/render/scene'
import {
  TextBreaker,
  createTextBreaker,
} from 'src/editor/render/text-break/text-breaker'
import { StageViewport, getZoom } from 'src/editor/stage/viewport'
import { INoopFunc, IXY, Raf, getTime } from 'src/shared/utils/normal'
import { rgba } from 'src/utils/color'
import TinyQueue from 'tinyqueue'
import { Elem } from './elem'

const dpr = devicePixelRatio

export type SurfaceCanvasType = 'mainCanvas' | 'topCanvas'

export type SurfaceRenderType =
  | 'firstFullRender'
  | 'nextFullRender'
  | 'partialRender'

@autoBind
export class StageSurface {
  inited = Signal.create(false)

  private container!: HTMLDivElement

  private canvas!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D

  private bufferCanvas = new OffscreenCanvas(0, 0)
  private bufferCtx = this.bufferCanvas.getContext('2d')!

  textBreaker!: TextBreaker

  async initTextBreaker() {
    this.textBreaker = await createTextBreaker()
  }

  subscribe() {
    return Disposer.collect(
      this.inited.hook(() => {
        this.onResize()
        this.onZoomMove()
        this.onPointerEvents()
      }),
      () => (this.inited.value = false),
    )
  }

  setContainer = (container: HTMLDivElement) => {
    if (this.container) return
    this.container = container
  }

  setCanvas = (canvas: HTMLCanvasElement) => {
    if (this.canvas) return
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
  }

  setCursor = (cursor: string) => {
    this.container.style.cursor = cursor
  }

  clearSurface = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  ctxSaveRestore = (func: (ctx: CanvasRenderingContext2D) => any) => {
    this.ctx.save()
    func(this.ctx)
    this.ctx.restore()
  }

  setMatrix = (obb: OBB, inverse = false) => {
    const { x, y, rotation } = obb
    if (!inverse) {
      this.ctx.translate(x, y)
      this.ctx.rotate(Angle.radianFy(rotation))
    } else {
      this.ctx.rotate(-Angle.radianFy(rotation))
      this.ctx.translate(-x, -y)
    }
  }

  private renderType?: SurfaceRenderType
  private renderTasks: INoopFunc[] = []
  private raf = new Raf()

  private requestRender = (type: SurfaceRenderType) => {
    if (this.renderType === type) return
    this.renderType = type

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
      this.renderType = undefined
      this.renderTasks.length && next()
    })
  }

  private fullRenderElemsMinHeap: TinyQueue<{
    elem: Elem
    selfIndex: number
    layerIndex: number
  }> = new TinyQueue()

  private calcFullRenderElemsMinHeap() {
    this.fullRenderElemsMinHeap = new TinyQueue(undefined, (a, b) => {
      if (a.layerIndex !== b.layerIndex) return a.layerIndex - b.layerIndex
      const aDistance = XY.center(AABB.rect(a.elem.aabb)).minus(
        this.eventXY || XY._(0, 0),
      )
      const bDistance = XY.center(AABB.rect(b.elem.aabb)).minus(
        this.eventXY || XY._(0, 0),
      )
      const aLane = max(abs(aDistance.x), abs(aDistance.y))
      const bLane = max(abs(bDistance.x), abs(bDistance.y))
      return aLane - bLane
      // return aDistance - bDistance
      // return a.selfIndex - b.selfIndex
    })

    StageScene.sceneRoot.children.forEach((elem, selfIndex) => {
      if (!elem.visible) return
      this.fullRenderElemsMinHeap.push({ elem, selfIndex, layerIndex: 0 })
    })
  }

  private fullRender = () => {
    this.transformMatrix()

    if (!getEditorSetting().needSliceRender || getEditorSetting().showDirtyRect) {
      StageScene.rootElems.forEach((elem) =>
        elem.children.forEach((elem) => elem.traverseDraw()),
      )
      return
    }

    if (!this.fullRenderElemsMinHeap.length) return

    const startTime = getTime()
    while (getTime() - startTime <= 4) {
      const elem = this.fullRenderElemsMinHeap.pop()?.elem
      elem?.traverseDraw()
    }

    this.requestRender('nextFullRender')
  }

  private patchRender = (reRenderElems: Set<Elem>) => {
    this.transformMatrix()

    StageScene.rootElems.forEach((elem) => {
      elem.children.forEach((elem) => {
        reRenderElems.has(elem) && elem.traverseDraw()
      })
    })
  }

  private accumulatedErrorX = 0
  private accumulatedErrorY = 0

  private translate = (cur: IXY, prev: IXY) => {
    if (this.renderType) return

    const { width, height } = this.canvas
    const delta = XY.from(cur).minus(prev)
    const reRenderElems = new Set<Elem>()

    const traverse = (elem: Elem) => {
      if (!elem.visible) return
      if (AABB.include(StageViewport.prevAABB, elem.aabb) === 1) return
      reRenderElems.add(elem)
    }

    const idealX = delta.x * dpr + this.accumulatedErrorX
    const idealY = delta.y * dpr + this.accumulatedErrorY

    const actualX = round(idealX)
    const actualY = round(idealY)

    this.accumulatedErrorX = idealX - actualX
    this.accumulatedErrorY = idealY - actualY

    this.bufferCtx.clearRect(0, 0, width, height)
    this.bufferCtx.drawImage(
      this.canvas,
      0,
      0,
      width,
      height,
      actualX,
      actualY,
      width,
      height,
    )

    this.ctx.clearRect(0, 0, width, height)
    this.ctx.drawImage(this.bufferCanvas, 0, 0, width, height, 0, 0, width, height)

    StageScene.rootElems.forEach((elem) => elem.children.forEach(traverse))
    this.ctxSaveRestore(() => this.patchRender(reRenderElems))
  }

  private dirtyRects = new Set<AABB>()

  collectDirty = (elem: Elem) => {
    const dirtyRect = elem.getDirtyRect()
    if (dirtyRect) {
      this.dirtyRects.add(dirtyRect)
      this.requestRender('partialRender')
    }
  }

  private partialRender = () => {
    const reRenderElems = new Set<Elem>()
    let dirtyArea = AABB.merge(...this.dirtyRects)
    let needReTest = true

    const traverse = (elem: Elem) => {
      if (!elem.visible) return
      if (!AABB.collide(dirtyArea, elem.aabb)) return

      if (AABB.include(dirtyArea, elem.aabb) !== 1) {
        dirtyArea = AABB.merge(dirtyArea, elem.aabb)
        needReTest = true
      }
      reRenderElems.add(elem)
      elem.children.forEach(traverse)
    }

    while (needReTest) {
      needReTest = false
      reRenderElems.clear()
      StageScene.rootElems.forEach((elem) => elem.children.forEach(traverse))
    }

    this.ctxSaveRestore(() => {
      this.transformMatrix()
      const { minX, minY, maxX, maxY } = dirtyArea
      this.ctx.clearRect(minX, minY, maxX - minX, maxY - minY)
      this.dirtyRects.clear()
    })

    if (getEditorSetting().showDirtyRect) {
      this.devShowDirtyRect(dirtyArea)
    } else {
      this.patchRender(reRenderElems)
    }
  }

  private devShowDirtyRect(dirtyArea: AABB) {
    this.clearSurface()

    this.ctxSaveRestore(() => {
      this.fullRender()
    })

    this.ctxSaveRestore((ctx) => {
      this.transformMatrix()

      const path2d = new Path2D()
      const { minX, minY, maxX, maxY } = dirtyArea
      path2d.rect(minX, minY, maxX - minX, maxY - minY)
      ctx.strokeStyle = rgba(0, 255, 100, 1)
      ctx.stroke(path2d)
    })
  }

  private dprMatrix = Matrix.of(dpr, 0, 0, dpr, 0, 0)

  transformMatrix = () => {
    this.ctx.transform(...this.dprMatrix.tuple())
    this.ctx.transform(...StageViewport.matrix.tuple())
  }

  private onZoomMove = () => {
    reaction(
      () => StageViewport.zoom,
      () => this.requestRender('firstFullRender'),
    )
    reaction(
      () => XY.from(StageViewport.offset),
      (offset, prevOffset) => this.translate(offset, prevOffset),
    )
  }

  private onResize() {
    reaction(
      () => ({ ...StageViewport.bound }),
      ({ width, height }) => {
        const canvasWidth = width * dpr
        const canvasHeight = height * dpr
        this.canvas.width = canvasWidth
        this.bufferCanvas.width = canvasWidth
        this.canvas.height = canvasHeight
        this.bufferCanvas.height = canvasHeight
        this.canvas.style.width = `${width}px`
        this.canvas.style.height = `${height}px`
      },
      { fireImmediately: true },
    )
    reaction(
      () => ({ ...StageViewport.bound }),
      () => this.requestRender('firstFullRender'),
    )
  }

  testVisible = (aabb: AABB) => {
    return AABB.collide(aabb, StageViewport.AABB)
  }

  getVisualSize = (aabb: AABB) => {
    const zoom = getZoom()
    return XY._((aabb.maxX - aabb.minX) * zoom, (aabb.maxY - aabb.minY) * zoom)
  }

  addEvent = <K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ) => {
    if (this.inited.value) {
      this.container.addEventListener(type, listener, options)
    } else {
      this.inited.hook(() =>
        this.container.addEventListener(type, listener, options),
      )
    }
    return () => this.container.removeEventListener(type, listener, options)
  }

  private eventXY!: IXY

  private getEventXY = (xy: IXY) => {
    xy = StageViewport.toCanvasXY(xy)
    this.eventXY = StageViewport.matrix.invertXY(xy)
    this.elemsFromPoint = []
  }

  private traverseLayerList = (
    func: (
      elem: Elem,
      capture: boolean,
      stopped: boolean,
      stopPropagation: INoopFunc,
      hitList?: Elem[],
      xy?: IXY,
    ) => any,
    noBubble?: boolean,
  ) => {
    let stopped = false
    const stopPropagation = () => (stopped = true)

    const traverse = (layerIndex: number, elem: Elem, hitList?: Elem[]) => {
      if (!elem.visible) return

      if (this.eventXY) {
        const xy = XY.from(this.eventXY)
          .rotate(elem.obb.xy, -elem.obb.rotation)
          .minus(elem.obb.xy)

        func(elem, true, stopped, stopPropagation, hitList!, xy)

        const subHitList: Elem[] = []
        reverseFor(elem.children, (elem) => traverse(layerIndex, elem, subHitList))
        this.elemsFromPoint.push(...subHitList)

        !noBubble && func(elem, false, stopped, stopPropagation, undefined, xy)
      } else {
        func(elem, true, stopped, stopPropagation)

        reverseFor(elem.children, (elem) => traverse(layerIndex, elem))
        !noBubble && func(elem, false, stopped, stopPropagation)
      }
    }

    reverseFor(StageScene.rootElems, (elem, i) => traverse(i, elem, []))
  }

  private elemsFromPoint: Elem[] = []

  getElemsFromPoint(e?: IXY) {
    if (!e) return this.elemsFromPoint

    this.getEventXY(e)
    this.traverseLayerList(
      (elem, capture, stopped, stopPropagation, hitList, xy) => {
        const hit = elem.hitTest(xy!)
        if (hit) hitList?.push(elem)
      },
    )

    return this.elemsFromPoint
  }

  private onPointerEvents = () => {
    const onMouseEvent = (e: MouseEvent) => {
      if (this.isPointerEventNone) return
      if (this.fullRenderElemsMinHeap.length) return

      this.getEventXY(e)
      this.traverseLayerList(
        (elem, capture, stopped, stopPropagation, hitList, xy) => {
          const hit = elem.hitTest(xy!)
          if (hit) hitList?.push(elem)
          if (!stopped)
            elem.eventHandle.triggerMouseEvent(e, xy!, hit, capture, stopPropagation)
        },
      )
    }

    this.addEvent('mousedown', onMouseEvent, { capture: true })
    this.addEvent('mousemove', onMouseEvent, { capture: true })
  }

  private isPointerEventNone = false

  disablePointEvent(setbackOnPointerUp = true) {
    this.isPointerEventNone = true
    listen('mouseup', { once: true }, () => {
      if (setbackOnPointerUp) this.enablePointEvent()
    })
  }

  enablePointEvent() {
    this.isPointerEventNone = false
  }
}

export const Surface = new StageSurface()
