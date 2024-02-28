import autobind from 'class-autobind-decorator'
import hotkeys from 'hotkeys-js'
import { EventWheelService } from '~/global/event/wheel'
import { createSignal } from '~/shared/signal'
import { XY } from '~/shared/structure/xy'
import { IXY } from '~/shared/utils/normal'
import { max } from '../math/base'
import { SchemaPage } from '../schema/page'
import { Pixi } from './pixi'

@autobind
export class StageViewportService {
  inited = createSignal(false)
  bound = createSignal({ x: 240, y: 44, width: 0, height: 0, right: 240 })
  zoom = createSignal(1)
  stageOffset = createSignal({ x: 0, y: 0 })
  beforeZoom = createSignal()
  duringZoom = createSignal()
  afterZoom = createSignal()
  private wheeler = new EventWheelService()
  initHook() {
    Pixi.inited.hook(() => {
      this.bound.hook(this.onResizeBound, ['immediately'])
      window.addEventListener('resize', this.onResizeBound)
      this.onWheelZoom()
      Pixi.addListener('wheel', (e) => this.wheeler.onWheel(e as WheelEvent))
      this.inited.dispatch()
    })
    SchemaPage.currentPage.hook((page) => {
      this.zoom.dispatch(page.zoom)
      this.stageOffset.dispatch(XY.Of(page.x, page.y))
    })
    this.zoom.hook(() => {
      Pixi.sceneStage.scale.set(this.zoom.value, this.zoom.value)
      SchemaPage.currentPage.value.zoom = this.zoom.value
    })
    this.stageOffset.hook(() => {
      const { x, y } = this.stageOffset.value
      Pixi.sceneStage.position.set(x, y)
      SchemaPage.currentPage.value.x = x
      SchemaPage.currentPage.value.y = y
    })
  }
  toViewportXY(xy: IXY) {
    return XY.From(xy).minus(this.bound.value)
  }
  toStageXY(xy: IXY) {
    return this.toViewportXY(xy).minus(this.stageOffset.value)
  }
  toSceneStageXY(xy: IXY) {
    return this.toViewportXY(xy).minus(this.stageOffset.value).divide(this.zoom.value)
  }
  toSceneStage(key: 'x' | 'y', num: number) {
    const viewportXY = num - this.bound.value[key]
    const stageXY = viewportXY - this.stageOffset.value[key]
    return stageXY / this.zoom.value
  }
  toSceneStageShiftXY(xy: IXY) {
    return XY.From(xy).divide(this.zoom.value)
  }
  toSceneStageShift(shift: number) {
    return shift / this.zoom.value
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
      const { deltaY, clientX, clientY } = e
      if (!hotkeys.ctrl) {
        return this.stageOffset.dispatch((offset) => {
          offset[hotkeys.shift ? 'x' : 'y'] -= deltaY
        })
      }
      e.preventDefault()
      const sign = deltaY > 0 ? -1 : 1
      const stepByZoom = getStepByZoom()
      const step = stepByZoom.find(([_zoom, _step]) => _zoom <= this.zoom.value)![1] * sign
      const newZoom = max(0.02, this.zoom.value + step)
      const sceneStageXY = this.toSceneStageXY(new XY(clientX, clientY))
      const newOffset = XY.From(this.stageOffset.value).plus(sceneStageXY.multiply(-step))
      this.zoom.dispatch(newZoom)
      this.stageOffset.dispatch(newOffset)
      this.duringZoom.dispatch()
    })
    this.wheeler.afterWheel.hook(({ e }) => {
      if (hotkeys.ctrl) e.preventDefault()
      this.afterZoom.dispatch()
    })
  }
  private onResizeBound() {
    const { x, y, right } = this.bound.value
    this.bound.value = {
      ...this.bound.value,
      width: window.innerWidth - x - right,
      height: window.innerHeight - y + 1,
    }
    Pixi.container.style.width = this.bound.value.width + 'px'
    Pixi.container.style.height = this.bound.value.height + 'px'
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
