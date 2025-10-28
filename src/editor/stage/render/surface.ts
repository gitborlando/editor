import { AABB, Angle, OBB } from '@gitborlando/geo'
import { reverseFor } from '@gitborlando/utils'
import autoBind from 'class-autobind-decorator'
import { EditorSetting } from 'src/editor/editor/setting'
import { abs, max } from 'src/editor/math/base'
import {
  IMatrix,
  mx_applyAABB,
  mx_create,
  mx_invertAABB,
  mx_invertPoint,
} from 'src/editor/math/matrix'
import { xy_, xy_center, xy_minus, xy_rotate } from 'src/editor/math/xy'
import { StageScene } from 'src/editor/stage/render/scene'
import {
  TextBreaker,
  createTextBreaker,
} from 'src/editor/stage/render/text-break/text-breaker'
import { StageViewport, getZoom } from 'src/editor/stage/viewport'
import { INoopFunc, IXY, Raf, getTime } from 'src/shared/utils/normal'
import TinyQueue from 'tinyqueue'
import { Elem } from './elem'

const dpr = devicePixelRatio

@autoBind
export class StageSurface {
  inited$ = Signal.create(false)

  private canvas!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D

  private bufferCanvas = new OffscreenCanvas(0, 0)
  private bufferCtx = this.bufferCanvas.getContext('2d')!

  textBreaker!: TextBreaker

  async initTextBreaker() {
    this.textBreaker = await createTextBreaker()
  }

  setCanvas = (canvas: HTMLCanvasElement) => {
    if (this.inited$.value) return

    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!

    this.onResize()
    this.onZoomMove()
    this.handlePointerEvents()

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

  private renderTasks: INoopFunc[] = []
  private raf = new Raf()

  private requestRender = (
    type: 'firstFullRender' | 'nextFullRender' | 'partialRender',
  ) => {
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

  private fullRenderElemsMinHeap: TinyQueue<{
    elem: Elem
    selfIndex: number
    layerIndex: number
  }> = new TinyQueue()

  private calcFullRenderElemsMinHeap() {
    this.fullRenderElemsMinHeap = new TinyQueue(undefined, (a, b) => {
      if (a.layerIndex !== b.layerIndex) return a.layerIndex - b.layerIndex
      const aDistance = xy_minus(
        xy_center(AABB.rect(a.elem.aabb)),
        this.eventXY || xy_(),
      )
      const bDistance = xy_minus(
        xy_center(AABB.rect(b.elem.aabb)),
        this.eventXY || xy_(),
      )
      const aLane = max(abs(aDistance.x), abs(aDistance.y))
      const bLane = max(abs(bDistance.x), abs(bDistance.y))
      return aLane - bLane
      // return aDistance - bDistance
      // return a.selfIndex - b.selfIndex
    })
    StageScene.rootElems.forEach((elem, layerIndex) =>
      elem.children.forEach((elem, selfIndex) => {
        if (!elem.visible) return
        this.fullRenderElemsMinHeap.push({ elem, selfIndex, layerIndex })
      }),
    )
  }

  private fullRender = () => {
    this.ctx.transform(...this.dprMatrix)
    this.ctx.transform(...this.viewportMatrix)

    if (!EditorSetting.setting.needSliceRender) {
      StageScene.rootElems.forEach((elem) => elem.traverseDraw())
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
    this.ctx.transform(...this.dprMatrix)
    this.ctx.transform(...this.viewportMatrix)

    StageScene.rootElems.forEach((elem) => {
      elem.children.forEach((elem) => {
        reRenderElems.has(elem) && elem.traverseDraw()
      })
    })
  }

  private xNotIntTime = 0
  private yNotIntTime = 0

  private translate = (cur: IXY, prev: IXY) => {
    const { width, height } = this.canvas
    const tr = xy_minus(cur, prev)
    const reRenderElems = new Set<Elem>()

    const traverse = (elem: Elem) => {
      if (!elem.visible) return
      if (AABB.include(this.prevViewportAABB, elem.aabb) === 1) return
      reRenderElems.add(elem)
    }

    const xNotInt = !Number.isInteger(tr.x * dpr)
    const yNotInt = !Number.isInteger(tr.y * dpr)

    this.xNotIntTime += xNotInt ? 1 : 0
    this.yNotIntTime += yNotInt ? 1 : 0

    this.bufferCtx.clearRect(0, 0, width, height)
    this.bufferCtx.drawImage(
      this.canvas,
      0,
      0,
      width,
      height,
      tr.x * dpr + (xNotInt ? -0.5 : 0),
      tr.y * dpr + (yNotInt ? -0.5 : 0),
      width,
      height,
    )

    this.ctx.clearRect(0, 0, width, height)
    this.ctx.drawImage(
      this.bufferCanvas,
      0,
      0,
      width,
      height,
      this.xNotIntTime === 2 ? 1 : 0,
      this.yNotIntTime === 2 ? 1 : 0,
      width,
      height,
    )

    this.yNotIntTime = this.yNotIntTime === 2 ? 0 : this.yNotIntTime
    this.xNotIntTime = this.xNotIntTime === 2 ? 0 : this.xNotIntTime

    StageScene.rootElems.forEach((elem) => elem.children.forEach(traverse))
    this.ctxSaveRestore(() => this.patchRender(reRenderElems))
  }

  private dirtyRects = new Set<AABB>()

  collectDirty = (elem: Elem) => {
    const dirtyRect = elem.getDirtyRect()
    if (!dirtyRect) return

    this.dirtyRects.add(dirtyRect)
    this.requestRender('partialRender')
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
  viewportAABB!: AABB
  private prevViewportAABB!: AABB

  private onZoomMove = () => {
    autorun(() => {
      const { zoom, offset } = StageViewport
      this.prevViewportMatrix =
        this.viewportMatrix || mx_create(zoom, 0, 0, zoom, offset.x, offset.y)
      this.viewportMatrix = mx_create(zoom, 0, 0, zoom, offset.x, offset.y)
      this.prevViewportAABB = mx_invertAABB(this.boundAABB, this.prevViewportMatrix)
      this.viewportAABB = mx_invertAABB(this.boundAABB, this.viewportMatrix)
    })
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
        this.canvas.width = this.bufferCanvas.width = width * dpr
        this.canvas.height = this.bufferCanvas.height = height * dpr
        this.canvas.style.width = `${width}px`
        this.canvas.style.height = `${height}px`
        this.boundAABB = new AABB(0, 0, width, height)
      },
      { fireImmediately: true },
    )
    reaction(
      () => ({ ...StageViewport.bound }),
      () => this.requestRender('firstFullRender'),
    )
  }

  testVisible = (aabb: AABB) => {
    return AABB.collide(aabb, this.viewportAABB)
  }

  getVisualSize = (aabb: AABB) => {
    const zoom = getZoom()
    return xy_((aabb.maxX - aabb.minX) * zoom, (aabb.maxY - aabb.minY) * zoom)
  }

  addEvent = <K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ) => {
    if (this.inited$.value) {
      this.canvas.addEventListener(type, listener, options)
    } else {
      this.inited$.hook(() => this.canvas.addEventListener(type, listener, options))
    }
    return () => {
      this.canvas.removeEventListener(type, listener, options)
    }
  }

  removeEvent<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ) {
    this.canvas.removeEventListener(type, listener, options)
  }

  private eventXY!: IXY

  private getEventXY = (xy: IXY) => {
    const bound = StageViewport.bound
    xy = xy_minus(xy, XY.of(bound.left, bound.top))
    this.eventXY = mx_invertPoint(xy, this.viewportMatrix)
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
        let xy = xy_rotate(this.eventXY, elem.obb.xy, -elem.obb.rotation)
        xy = xy_minus(xy, elem.obb.xy)

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

  private handlePointerEvents = () => {
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
    window.addEventListener('pointerup', () => {
      if (setbackOnPointerUp) this.isPointerEventNone = false
    })
  }

  enablePointEvent() {
    this.isPointerEventNone = false
  }
}

export const Surface = new StageSurface()
