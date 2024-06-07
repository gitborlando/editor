import autobind from 'class-autobind-decorator'
import hotkeys from 'hotkeys-js'
import { Surface } from 'src/editor/stage/render/surface'
import { EventWheelService } from 'src/global/event/wheel'
import { createSignal } from 'src/shared/signal/signal'
import { INoopFunc, IRect, IXY } from 'src/shared/utils/normal'
import { max } from '../math/base'
import {
  xy_,
  xy_client,
  xy_divide,
  xy_from,
  xy_minus,
  xy_multiply,
  xy_plus,
  xy_plus_all,
} from '../math/xy'
import { Schema } from '../schema/schema'

const initBound = {
  x: 280,
  y: 44,
  right: 240,
  width: window.innerWidth - 520,
  height: window.innerHeight - 44 + 1,
}

const stepByZoom = [
  [0, 0.02],
  [0.1, 0.03],
  [0.2, 0.05],
  [0.3, 0.1],
  [0.5, 0.2],
  [1.2, 0.3],
  [1.5, 0.5],
  [2, 1],
  [3, 2],
  [5, 3],
].reverse()

@autobind
class StageViewportService {
  inited = createSignal(false)
  bound = createSignal(initBound)
  zoom = createSignal(1)
  stageOffset = createSignal({ x: 100, y: 100 })
  beforeZoom = createSignal()
  duringZoom = createSignal()
  afterZoom = createSignal()
  private wheeler = new EventWheelService()

  initHook() {
    Surface.inited.hook(() => {
      this.onResizeBound()
      window.addEventListener('resize', this.onResizeBound)
      this.onWheelZoom()
      this.zoom.dispatch(1)
      this.stageOffset.dispatch(xy_(100, 100))
      this.inited.dispatch()
    })
    this.onListenViewportChange()
  }

  getViewport() {
    return { zoom: this.zoom.value, x: this.stageOffset.value.x, y: this.stageOffset.value.y }
  }
  toViewportXY(xy: IXY) {
    return xy_minus(xy, this.bound.value)
  }
  toStageXY(xy: IXY) {
    return xy_minus(this.toViewportXY(xy), this.stageOffset.value)
  }
  toSceneXY(xy: IXY) {
    return xy_divide(this.toStageXY(xy), this.zoom.value)
  }
  toSceneShift(xy: IXY) {
    return xy_divide(xy, this.zoom.value)
  }
  toSceneMarquee(marquee: IRect) {
    return {
      ...this.toSceneXY(marquee),
      width: marquee.width / this.zoom.value,
      height: marquee.height / this.zoom.value,
    }
  }
  sceneStageToClientXY(xy: IXY) {
    return xy_plus_all(xy_multiply(xy, this.zoom.value), this.stageOffset.value, this.bound.value)
  }
  inViewport(xy: IXY) {
    const { x, y, width } = this.bound.value
    return xy.x > x && xy.x < x + width && xy.y > y
  }

  private onWheelZoom() {
    this.wheeler.beforeWheel.hook(({ e }) => {
      if (hotkeys.ctrl) e.preventDefault()
      this.beforeZoom.dispatch()
    })
    this.wheeler.duringWheel.hook(({ e }) => {
      if (!hotkeys.ctrl) {
        const oldXY = Schema.client.viewport[Schema.client.selectPageId].xy
        oldXY[hotkeys.shift ? 'x' : 'y'] -= e.deltaY
        Schema.itemReset(
          Schema.client,
          ['viewport', Schema.client.selectPageId, 'xy'],
          xy_from(oldXY)
        )
        Schema.commitOperation('移动画布')
        Schema.nextSchema()
        return
      }
      e.preventDefault()
      const sign = e.deltaY > 0 ? -1 : 1
      const step = stepByZoom.find(([_zoom, _step]) => _zoom <= this.zoom.value)![1] * sign
      const newZoom = max(0.02, this.zoom.value + step)
      const sceneStageXY = this.toSceneXY(xy_client(e))
      const newOffset = xy_plus(this.stageOffset.value, xy_multiply(sceneStageXY, -step))
      Schema.itemReset(Schema.client, ['viewport', Schema.client.selectPageId, 'zoom'], newZoom)
      Schema.itemReset(Schema.client, ['viewport', Schema.client.selectPageId, 'xy'], newOffset)
      Schema.commitOperation('缩放画布')
      Schema.nextSchema()
      this.duringZoom.dispatch()
    })
    this.wheeler.afterWheel.hook(({ e }) => {
      if (hotkeys.ctrl) e.preventDefault()
      this.afterZoom.dispatch()
      // Schema.commitHistory('缩放画布')
    })
    Surface.addEvent('wheel', (e) => {
      this.wheeler.onWheel(e as WheelEvent)
    })
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

  private onListenViewportChange() {
    const disposers = <INoopFunc[]>[]
    const onChangeZoomOffset = () => {
      disposers.forEach((disposer) => disposer())
      const selectPageId = Schema.client.selectPageId
      const disposeZoom = Schema.onMatchPatch(`/?/?/${selectPageId}/zoom`, () => {
        this.zoom.dispatch(Schema.client.viewport[selectPageId].zoom)
      })
      const disposeOffset = Schema.onMatchPatch(`/?/?/${selectPageId}/xy`, () =>
        this.stageOffset.dispatch(Schema.client.viewport[selectPageId].xy)
      )
      disposers.push(...disposeZoom, ...disposeOffset)
    }
    Schema.inited.hook(() => onChangeZoomOffset())
    Schema.onMatchPatch('/client/selectPageId', () => onChangeZoomOffset())
  }
}

export const StageViewport = new StageViewportService()

export function getZoom() {
  return StageViewport.zoom.value
}
