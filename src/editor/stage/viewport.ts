import { makeObservable, observable, when } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { Watch, autobind } from '~/shared/decorator'
import { XY } from '~/shared/helper/xy'
import { IXY } from '~/shared/utils'
import { SchemaPageService, injectSchemaPage } from '../schema/page'
import { PixiService, injectPixi } from './pixi'

@autobind
@injectable()
export class StageViewportService {
  @observable initialized = false
  @observable bound = { x: 240, y: 48, width: 0, height: 0, right: 240 }
  constructor(
    @injectPixi private Pixi: PixiService,
    @injectSchemaPage private SchemaPage: SchemaPageService
  ) {
    makeObservable(this)
    when(() => Pixi.initialized).then(() => this.onResizeBound())
    when(() => SchemaPage.initialized).then(() => {
      this.autoSetPixiStageZoom()
      this.autoSetPixiStageOffset()
      this.onWheelZoom()
      this.initialized = true
    })
  }
  get zoom() {
    return this.SchemaPage.currentPage.zoom
  }
  get stageOffset() {
    return this.SchemaPage.currentPage.offset
  }
  setZoom(zoom: number) {
    this.SchemaPage.currentPage.zoom = zoom
  }
  setStageOffset(xy: IXY) {
    this.SchemaPage.currentPage.offset = xy
  }
  toViewportXY(xy: IXY) {
    return XY.From(xy).minus(this.bound)
  }
  toStageXY(xy: IXY) {
    return this.toViewportXY(xy).minus(this.stageOffset)
  }
  toRealStageXY(xy: IXY) {
    return this.toViewportXY(xy).minus(this.stageOffset).divide(this.zoom)
  }
  toRealStageShift(xy: IXY) {
    return XY.From(xy).divide(this.zoom)
  }
  inViewport(xy: IXY) {
    return xy.x > this.bound.x && xy.x < this.bound.x + this.bound.width && xy.y > this.bound.y
  }
  @Watch('zoom')
  private autoSetPixiStageZoom() {
    this.Pixi.stage.scale.set(this.zoom, this.zoom)
  }
  @Watch('stageOffset')
  private autoSetPixiStageOffset() {
    this.Pixi.stage.position.set(this.stageOffset.x, this.stageOffset.y)
  }
  private onWheelZoom() {
    const onWheel = ({ deltaY, clientX, clientY }: WheelEvent) => {
      if (!this.inViewport(new XY(clientX, clientY))) return
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
      const newOffset = XY.From(this.stageOffset).plus(realStageXY.multiply(-step))
      this.setZoom(newZoom)
      this.setStageOffset(newOffset)
    }
    window.addEventListener('wheel', onWheel)
  }
  private onResizeBound() {
    const setBound = () => {
      this.bound = {
        ...this.bound,
        width: window.innerWidth - this.bound.x - this.bound.right,
        height: window.innerHeight - this.bound.y + 1,
      }
      this.Pixi.container.style.width = this.bound.width + 'px'
      this.Pixi.container.style.height = this.bound.height + 'px'
      this.Pixi.app?.resize()
    }
    setBound()
    window.addEventListener('resize', setBound)
  }
}

export const injectStageViewport = inject(StageViewportService)
