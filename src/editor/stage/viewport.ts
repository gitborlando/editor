import autobind from 'class-autobind-decorator'
import hotkeys from 'hotkeys-js'
import { AABB } from 'src/editor/math/obb'
import { OperatePage } from 'src/editor/operate/page'
import { Schema } from 'src/editor/schema/schema'
import { Elem } from 'src/editor/stage/render/elem'
import { Surface } from 'src/editor/stage/render/surface'
import { EventWheelService } from 'src/global/event/wheel'
import { createSignal } from 'src/shared/signal/signal'
import { IRect, IXY } from 'src/shared/utils/normal'
import { max } from '../math/base'
import {
  xy_center,
  xy_client,
  xy_divide,
  xy_from,
  xy_minus,
  xy_multiply,
  xy_plus,
  xy_plus_all,
} from '../math/xy'

const initBound = {
  x: 280,
  y: 44,
  right: 240,
  width: window.innerWidth - 280 - 240,
  height: window.innerHeight - 44,
}

const stepByZoom = [
  [0, 0.02],
  [0.1, 0.04],
  [0.2, 0.12],
  [0.4, 0.16],
  [0.8, 0.12],
  [2.4, 0.32],
  [3.6, 1.2],
  [5, 1.6],
]

@autobind
class StageViewportService {
  inited = createSignal(false)
  bound = createSignal(initBound)
  zoom$ = createSignal(1)
  offset$ = createSignal({ x: 0, y: 0 })
  beforeZoom = createSignal()
  afterZoom = createSignal()

  movingStage$ = createSignal<IXY>({ x: 0, y: 0 })
  zoomingStage$ = createSignal()

  private wheeler = new EventWheelService()

  initHook() {
    Surface.inited$.hook(() => {
      window.addEventListener('resize', this.onResizeBound)
      this.onWheelZoom()
      this.inited.dispatch()
    })

    Schema.onMatchPatch('/client/selectPageId', () => {
      const viewport = OperatePage.getCurrentViewport()
      this.zoom$.dispatch(viewport.zoom)
      this.offset$.dispatch(viewport.offset)
      this.zoomingStage$.dispatch(viewport.zoom)
    })

    this.zoom$.hook((zoom) => OperatePage.setCurrentViewport({ zoom }))
    this.offset$.hook((offset) => OperatePage.setCurrentViewport({ offset }))

    //  hotkeys('alt+l', this.centerStage)
  }

  getViewport() {
    return { zoom: this.zoom$.value, x: this.offset$.value.x, y: this.offset$.value.y }
  }
  toViewportXY(xy: IXY) {
    return xy_minus(xy, this.bound.value)
  }
  toStageXY(xy: IXY) {
    return xy_minus(this.toViewportXY(xy), this.offset$.value)
  }
  toSceneXY(xy: IXY) {
    return xy_divide(this.toStageXY(xy), this.zoom$.value)
  }
  toSceneShift(xy: IXY) {
    return xy_divide(xy, this.zoom$.value)
  }
  toSceneMarquee(marquee: IRect) {
    return {
      ...this.toSceneXY(marquee),
      width: marquee.width / this.zoom$.value,
      height: marquee.height / this.zoom$.value,
    }
  }
  sceneStageToClientXY(xy: IXY) {
    return xy_plus_all(xy_multiply(xy, this.zoom$.value), this.offset$.value, this.bound.value)
  }
  inViewport(xy: IXY) {
    const { x, y, width } = this.bound.value
    return xy.x > x && xy.x < x + width && xy.y > y
  }

  private onWheelZoom() {
    this.wheeler.beforeWheel.hook(({ e }) => {
      if (hotkeys.ctrl) e.preventDefault()
      this.beforeZoom.dispatch(true)
    })
    this.wheeler.duringWheel.hook(({ e }) => {
      if (!e.ctrlKey) {
        const oldOffset = this.offset$.value
        if (e.shiftKey) {
          oldOffset.x -= e.deltaY
        } else {
          if (e.deltaY === 0) oldOffset.x -= e.deltaX
          else oldOffset.y -= e.deltaY
        }
        this.offset$.dispatch(xy_from(oldOffset))
        this.movingStage$.dispatch(xy_from(oldOffset))
        return
      }

      e.preventDefault()

      const sign = e.deltaY > 0 ? -1 : 1
      const step = stepByZoom.findLast(([_zoom, _step]) => _zoom <= this.zoom$.value)![1] * sign

      const newZoom = max(0.01, this.zoom$.value + step)
      const zoomDelta = newZoom - this.zoom$.value

      const sceneStageXY = this.toSceneXY(xy_client(e))
      const newOffset = xy_plus(this.offset$.value, xy_multiply(sceneStageXY, -zoomDelta))

      this.zoom$.dispatch(newZoom)
      this.offset$.dispatch(newOffset)

      this.zoomingStage$.dispatch()
      this.movingStage$.value = xy_from(newOffset)
    })
    this.wheeler.afterWheel.hook(({ e }) => {
      if (hotkeys.ctrl) e.preventDefault()
      this.afterZoom.dispatch()
    })
    Surface.addEvent('wheel', (e) => this.wheeler.onWheel(e as WheelEvent))
    window.addEventListener('wheel', (e) => e.ctrlKey && e.preventDefault(), { passive: false })
  }

  private onResizeBound() {
    const { x, y, right } = this.bound.value
    this.bound.value = {
      ...this.bound.value,
      width: window.innerWidth - x - right,
      height: window.innerHeight - y + 1,
    }
    this.bound.dispatch(this.bound.value)
  }

  centerStage() {
    let allElemsAABB = new AABB(0, 0, 0, 0)

    const traverse = (elem: Elem) => {
      allElemsAABB = AABB.Merge([allElemsAABB, elem.aabb])
      elem.children.forEach(traverse)
    }
    Surface.layerList.forEach((elem) => elem.children.forEach(traverse))

    const allElemsRect = AABB.Rect(allElemsAABB)
    const viewportRect = AABB.Rect(Surface.viewportAABB)

    if (allElemsRect.width > viewportRect.width || allElemsRect.height > viewportRect.height) {
      const zoom = Math.min(
        viewportRect.width / allElemsRect.width,
        viewportRect.height / allElemsRect.height,
      )
      const shift = xy_multiply(
        xy_minus(xy_center(viewportRect), xy_center(allElemsRect)),
        zoom / getZoom(),
      )

      this.zoom$.dispatch(zoom)
      this.offset$.dispatch((offset) => xy_plus(offset, shift))
      this.zoomingStage$.dispatch()
    } else {
      const shift = xy_minus(xy_center(viewportRect), xy_center(allElemsRect))

      this.offset$.dispatch((offset) => xy_plus(offset, shift))
      this.movingStage$.dispatch()
    }
  }
}

export const StageViewport = new StageViewportService()

export function getZoom() {
  return StageViewport.zoom$.value
}
