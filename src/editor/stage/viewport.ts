import autobind from 'class-autobind-decorator'
import hotkeys from 'hotkeys-js'
import { EventWheelService } from '~/global/event/wheel'
import { createSignal } from '~/shared/signal/signal'
import { INoopFunc, IRect, IXY } from '~/shared/utils/normal'
import { max } from '../math/base'
import { xy_, xy_client, xy_divide, xy_minus, xy_multiply, xy_plus, xy_plus_all } from '../math/xy'
import { Schema } from '../schema/schema'
import { Pixi } from './pixi'

const initBound = {
  x: 240,
  y: 44,
  right: 240,
  width: window.innerWidth - 480,
  height: window.innerHeight - 44 + 1,
}

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
    Pixi.inited.hook(() => {
      this.bound.hook({ immediately: true }, this.onResizeBound)
      window.addEventListener('resize', this.onResizeBound)
      this.onWheelZoom()
      this.zoom.dispatch(1)
      this.stageOffset.dispatch(xy_(100, 100))
      this.inited.dispatch()
    })

    const disposers = <INoopFunc[]>[]
    Schema.onMatchPatch('/client/selectPageId', () => {
      disposers.forEach((disposer) => disposer())
      const disposeZoom = Schema.onMatchPatch(`/?/?/${Schema.client.selectPageId}/zoom`, () =>
        this.zoom.dispatch(Schema.client.viewport[Schema.client.selectPageId].zoom)
      )
      const disposeOffset = Schema.onMatchPatch(`/?/?/${Schema.client.selectPageId}/xy`, () =>
        this.stageOffset.dispatch(Schema.client.viewport[Schema.client.selectPageId].xy)
      )
      disposers.push(disposeZoom, disposeOffset)
    })

    this.zoom.hook(() => {
      Pixi.sceneStage.scale.set(this.zoom.value, this.zoom.value)
    })
    this.stageOffset.hook(() => {
      const { x, y } = this.stageOffset.value
      Pixi.sceneStage.position.set(x, y)
    })
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
        Schema.itemReset(Schema.client, ['viewport', Schema.client.selectPageId, 'xy'], oldXY)
        Schema.commitOperation('移动画布')
        Schema.nextSchema()
        return
      }
      e.preventDefault()
      const sign = e.deltaY > 0 ? -1 : 1
      const stepByZoom = getStepByZoom()
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
    Pixi.addListener('wheel', (e) => {
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
    Pixi.htmlContainer.style.width = this.bound.value.width + 'px'
    Pixi.htmlContainer.style.height = this.bound.value.height + 'px'
    Pixi.app.resize()
  }
}

export const StageViewport = new StageViewportService()

function getStepByZoom() {
  return [
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
}
