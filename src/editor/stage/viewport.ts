import { makeObservable, observable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { auto, autobind } from '~/helper/decorator'
import { EE } from '~/helper/event-emitter'
import { XY } from '../math/xy'
import { SchemaPageService, injectSchemaPage } from '../schema/page'
import { IXY } from '../utils'
import { PixiService, injectPixi } from './pixi'

@autobind
@injectable()
export class ViewportService {
  @observable zoom = 1
  @observable stageOffset = { x: 0, y: 0 }
  @observable bound = { x: 240, y: 48, width: 0, height: 0, right: 240 }
  constructor(
    @injectPixi private pixiService: PixiService,
    @injectSchemaPage private schemaPageService: SchemaPageService
  ) {
    makeObservable(this)
    EE.on('pixi-stage-initialized', () => {
      this.autoPixiStageZoom()
      this.autoPixiStageOffset()
      this.onResizeBound()
      this.onWheelZoom()
    })
  }
  setZoom(zoom: number) {
    this.zoom = zoom
    return this
  }
  setStageOffset(xy: IXY) {
    this.stageOffset = xy
    return this
  }
  toViewportXY(xy: IXY) {
    return XY.from(xy).minus(this.bound)
  }
  toStageXY(xy: IXY) {
    return this.toViewportXY(xy).minus(this.stageOffset)
  }
  toRealStageXY(xy: IXY) {
    return this.toViewportXY(xy).minus(this.stageOffset).divide(this.zoom)
  }
  toRealStageShift(xy: IXY) {
    return XY.from(xy).divide(this.zoom)
  }
  @auto private autoPixiStageZoom() {
    this.pixiService.stage.scale.set(this.zoom, this.zoom)
    this.schemaPageService.setCurrentPage({ zoom: this.zoom })
  }
  @auto private autoPixiStageOffset() {
    this.pixiService.stage.position.set(this.stageOffset.x, this.stageOffset.y)
    this.schemaPageService.setCurrentPage({
      offset: { x: this.stageOffset.x, y: this.stageOffset.y },
    })
  }
  private onWheelZoom() {
    const onWheel = ({ deltaY, clientX, clientY }: WheelEvent) => {
      const sign = deltaY > 0 ? -1 : 1
      const stepByZoom = [
        [0, 0.02],
        [0.1, 0.03],
        [0.2, 0.05],
        [0.3, 0.1],
        [0.5, 0.2],
        [1.2, 0.3],
        [2.5, 0.5],
      ].reverse()
      const step = stepByZoom.find(([_zoom, _step]) => _zoom <= this.zoom)![1] * sign
      let newZoom = this.zoom + step
      if (newZoom <= 0.02) return (newZoom = 0.02)
      const realStageXY = this.toRealStageXY(new XY(clientX, clientY))
      const newOffset = XY.from(this.stageOffset).plus(realStageXY.multiply(-step))
      this.setZoom(newZoom)
      this.setStageOffset(newOffset)
    }
    addEventListener('wheel', onWheel)
  }
  private onEnterZoom(zoom: number) {}
  private onResizeBound() {
    const setBound = () => {
      this.bound = {
        ...this.bound,
        width: window.innerWidth - this.bound.x - this.bound.right,
        height: window.innerHeight - this.bound.y + 1,
      }
      this.pixiService.container.style.width = this.bound.width + 'px'
      this.pixiService.container.style.height = this.bound.height + 'px'
      this.pixiService.app?.resize()
    }
    setBound()
    addEventListener('resize', setBound)
  }
}

export const injectViewport = inject(ViewportService)
