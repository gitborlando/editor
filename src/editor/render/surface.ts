import { NoopFunc, reverseFor } from '@gitborlando/utils'
import { listen } from '@gitborlando/utils/browser'
import CanvasKitInit, { Canvas, CanvasKit, Paint, Surface } from 'canvaskit-wasm'
import { getEditorSetting } from 'src/editor/editor/setting'
import { AABB, OBB } from 'src/editor/math'
import { abs, round } from 'src/editor/math/base'
import { StageScene } from 'src/editor/render/scene'
import {
  TextBreaker,
  createTextBreaker,
} from 'src/editor/render/text-break/text-breaker'
import { StageViewport, getZoom } from 'src/editor/stage/viewport'
import { Raf, getTime } from 'src/shared/utils/normal'
import TinyQueue from 'tinyqueue'
import { Elem } from './elem'

const dpr = devicePixelRatio

export type SurfaceCanvasType = 'mainCanvas' | 'topCanvas'

export type SurfaceRenderType =
  | 'firstFullRender'
  | 'nextFullRender'
  | 'partialRender'

export class StageSurfaceService {
  inited = Signal.create(false)

  ck!: CanvasKit

  surface!: Surface
  topSurface!: Surface
  bufferSurface: Surface | null = null

  ktx!: Canvas
  topKtx!: Canvas
  bufferKtx!: Canvas

  private container!: HTMLDivElement

  private canvas!: HTMLCanvasElement
  private ctx!: Canvas

  private topCanvas!: HTMLCanvasElement
  private topCtx!: Canvas

  private bufferCanvas = new OffscreenCanvas(0, 0)
  private bufferCtx?: Canvas

  // CanvasKit Paint objects
  private strokePaint!: Paint
  private fillPaint!: Paint

  textBreaker!: TextBreaker

  async initTextBreaker() {
    this.textBreaker = await createTextBreaker()
  }

  async initCanvasKit() {
    this.ck = await CanvasKitInit({
      locateFile: (file) => '/node_modules/canvaskit-wasm/bin/' + file,
    })
    this.canvas = document.getElementById('mainCanvas') as HTMLCanvasElement
    this.topCanvas = document.getElementById('topCanvas') as HTMLCanvasElement
    this.surface = this.ck.MakeWebGLCanvasSurface(this.canvas)!
    this.topSurface = this.ck.MakeWebGLCanvasSurface(this.topCanvas)!
    this.bufferSurface = this.ck.MakeSurface(1, 1)!
    this.ctx = this.surface.getCanvas()
    this.topCtx = this.topSurface.getCanvas()
    this.bufferCtx = this.bufferSurface.getCanvas()
    this.currentCtx = this.ctx

    this.inited.dispatch(true)
  }

  subscribe() {
    return Disposer.collect(
      this.inited.hook(() => {
        this.onResize()
        this.onZoomMove()
        this.onPointerEvents()
        this.requestRenderTopCanvas()
      }),
      this.devShowDirtyRect(),
      () => {
        this.dispose()
        this.inited.value = false
      },
    )
  }

  private dispose() {
    // 清理 Paint 对象
    if (this.strokePaint) {
      this.strokePaint.delete()
    }
    if (this.fillPaint) {
      this.fillPaint.delete()
    }

    // 清理 Surface 对象
    // if (this.bufferSurface) {
    //   this.bufferSurface.delete()
    // }
  }

  setContainer = (container: HTMLDivElement) => {
    if (this.container) return
    this.container = container
  }

  setCursor = (cursor: string) => {
    this.container.style.cursor = cursor
  }

  clearSurface = () => {
    this.currentCtx.clipRect(
      this.ck.XYWHRect(0, 0, this.canvas.width, this.canvas.height),
      this.ck.ClipOp.Intersect,
      true,
    )
    this.currentCtx.clear(this.ck.TRANSPARENT)
  }

  ctxSaveRestore(func: (ctx: Canvas) => any) {
    this.currentCtx.save()
    func(this.currentCtx)
    this.currentCtx.restore()
  }

  private currentCtx = this.ctx

  setCurrentCtxType = (type: SurfaceCanvasType) => {
    let lastCtx = this.currentCtx
    this.currentCtx = type === 'mainCanvas' ? this.ctx : this.topCtx
    return () => {
      this.currentCtx = lastCtx
    }
  }

  setOBBMatrix = (obb: OBB) => {
    const { x, y, rotation } = obb
    this.currentCtx.translate(x, y)
    this.currentCtx.rotate(rotation, 0, 0)
  }

  private renderType?: SurfaceRenderType
  private renderTasks: NoopFunc[] = []
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

    const render = () => {
      const resetCtx = this.setCurrentCtxType('mainCanvas')
      this.ctxSaveRestore(() => this.renderTasks.pop()?.())
      resetCtx()
      this.renderType = undefined
      this.renderTasks.length && this.surface.requestAnimationFrame(render)
    }
    this.surface.requestAnimationFrame(render)
  }

  onRenderTopCanvas = Signal.create()

  private hasRequestedRenderTopCanvas = false

  private requestRenderTopCanvas = () => {
    if (this.hasRequestedRenderTopCanvas) return
    this.hasRequestedRenderTopCanvas = true

    this.topSurface.requestAnimationFrame(() => {
      this.hasRequestedRenderTopCanvas = false

      const resetCtx = this.setCurrentCtxType('topCanvas')
      this.clearSurface()
      this.ctxSaveRestore(() => {
        this.transformMatrix()
        this.onRenderTopCanvas.dispatch(this.topCtx)
        StageScene.widgetRoot.children.forEach((elem) => elem.traverseDraw())
      })
      resetCtx()
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
      StageScene.sceneRoot.children.forEach((elem) => elem.traverseDraw())
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

    StageScene.sceneRoot.children.forEach((elem) => {
      reRenderElems.has(elem) && elem.traverseDraw()
    })
  }

  private accumulatedErrorX = 0
  private accumulatedErrorY = 0

  private translate = (cur: IXY, prev: IXY) => {
    if (this.renderType) return

    const delta = XY.from(cur).minus(prev)
    const reRenderElems = new Set<Elem>()

    const traverse = (elem: Elem) => {
      if (!elem.visible) return
      if (AABB.include(StageViewport.prevSceneAABB, elem.aabb) === 1) return
      reRenderElems.add(elem)
    }

    const idealX = delta.x * dpr + this.accumulatedErrorX
    const idealY = delta.y * dpr + this.accumulatedErrorY

    const actualX = round(idealX)
    const actualY = round(idealY)

    this.accumulatedErrorX = idealX - actualX
    this.accumulatedErrorY = idealY - actualY

    // 使用 CanvasKit 进行缓冲绘制
    this.bufferCtx?.clear(this.ck.TRANSPARENT)

    // 创建主画布的快照
    const snapshot = this.surface.makeImageSnapshot()
    if (snapshot) {
      // 在缓冲区绘制偏移后的图像
      this.bufferCtx?.save()
      this.bufferCtx?.translate(actualX, actualY)
      this.bufferCtx?.drawImage(snapshot, 0, 0, null)
      this.bufferCtx?.restore()
      snapshot.delete()
    }

    // 清除主画布并绘制缓冲内容
    console.log(this.bufferSurface)
    this.ctx.clear(this.ck.TRANSPARENT)
    const bufferSnapshot = this.bufferSurface?.makeImageSnapshot()
    if (bufferSnapshot) {
      this.ctx.drawImage(bufferSnapshot, 0, 0, null)
      bufferSnapshot.delete()
    }

    StageScene.sceneRoot.children.forEach(traverse)
    this.ctxSaveRestore(() => this.patchRender(reRenderElems))
  }

  private dirtyRects = new Set<AABB>()

  collectDirty = (elem: Elem) => {
    const dirtyRect = elem.getDirtyRect()
    if (dirtyRect) {
      this.dirtyRects.add(dirtyRect)
      if (elem.type === 'widgetElem') {
        this.requestRenderTopCanvas()
      } else {
        this.requestRender('partialRender')
      }
    }
  }

  private partialRender = () => {
    const reRenderElems = new Set<Elem>()
    let dirtyArea = AABB.merge(this.dirtyRects)
    let needReTest = true

    const traverse = (elem: Elem) => {
      if (!elem.visible) return
      if (!AABB.collide(dirtyArea, elem.aabb)) return

      if (AABB.include(dirtyArea, elem.aabb) !== 1) {
        dirtyArea = AABB.merge([dirtyArea, elem.aabb])
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

    this.ctxSaveRestore((ctx) => {
      // this.transformMatrix()
      const { minX, minY, maxX, maxY } = dirtyArea
      // 使用 CanvasKit 裁剪和清除
      ctx.save()
      ctx.clipRect(
        this.ck.XYWHRect(minX, minY, maxX - minX, maxY - minY),
        this.ck.ClipOp.Intersect,
        true,
      )
      ctx.clear(this.ck.TRANSPARENT)
      ctx.restore()
      this.dirtyRects.clear()
      this.devDirtyArea = dirtyArea
    })

    this.ctxSaveRestore(() => {
      this.patchRender(reRenderElems)
    })

    this.surface.flush()
  }

  private devDirtyArea?: AABB

  private devShowDirtyRect() {
    return this.onRenderTopCanvas.hook(() => {
      if (!getEditorSetting().showDirtyRect) return

      this.ctxSaveRestore((ctx) => {
        if (!this.devDirtyArea) return

        const path = new this.ck.Path()
        const { minX, minY, maxX, maxY } = this.devDirtyArea
        path.addRect(this.ck.XYWHRect(minX, minY, maxX - minX, maxY - minY))

        const paint = new this.ck.Paint()
        paint.setStyle(this.ck.PaintStyle.Stroke)
        paint.setColor(this.ck.Color(0, 255, 100, 1))

        ctx.drawPath(path, paint)

        path.delete()
        paint.delete()
      })
    })
  }

  transformMatrix = () => {
    const { a, tx, ty } = StageViewport.sceneMatrix
    this.currentCtx.scale(dpr, dpr)
    this.currentCtx.translate(tx, ty)
    this.currentCtx.scale(a, a)
  }

  private onZoomMove = () => {
    reaction(
      () => StageViewport.zoom,
      () => {
        this.requestRender('firstFullRender')
        this.requestRenderTopCanvas()
      },
    )
    reaction(
      () => XY.from(StageViewport.offset),
      (offset, prevOffset) => {
        this.translate(offset, prevOffset)
        this.requestRenderTopCanvas()
      },
    )
  }

  private onResize() {
    reaction(
      () => ({ ...StageViewport.bound }),
      ({ width, height }) => {
        const w = width * dpr
        const h = height * dpr

        ;[this.canvas, this.topCanvas].forEach((canvas) => {
          canvas.width = w
          canvas.height = h
          canvas.style.width = `${width}px`
          canvas.style.height = `${height}px`
        })
        this.bufferCanvas.width = w
        this.bufferCanvas.height = h

        this.surface = this.ck.MakeWebGLCanvasSurface(this.canvas)!
        this.topSurface = this.ck.MakeWebGLCanvasSurface(this.topCanvas)!
        this.bufferSurface = this.ck.MakeSurface(w, h)!
        this.ctx = this.surface.getCanvas()
        this.topCtx = this.topSurface.getCanvas()
        this.bufferCtx = this.bufferSurface.getCanvas()
        this.currentCtx = this.ctx

        // if (this.bufferSurface) {
        //   this.bufferSurface.delete()
        // }
        // this.bufferSurface = this.ck.MakeSurface(w, h)
        // this.bufferCtx = this.bufferSurface?.getCanvas()
        this.surface.flush()
        this.topSurface.flush()
      },
      { fireImmediately: true },
    )
    reaction(
      () => ({ ...StageViewport.bound }),
      () => this.requestRender('firstFullRender'),
    )
  }

  testVisible = (aabb: AABB) => {
    return AABB.collide(aabb, StageViewport.sceneAABB)
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
    this.eventXY = StageViewport.sceneMatrix.invertXY(xy)
    this.elemsFromPoint = []
  }

  private traverseLayerList = (
    func: (
      elem: Elem,
      capture: boolean,
      stopped: boolean,
      stopPropagation: NoopFunc,
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

export const StageSurface = autoBind(new StageSurfaceService())
