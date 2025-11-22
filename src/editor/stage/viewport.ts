import { IRect, IXY, XY } from '@gitborlando/geo'
import { listen, WheelUtil } from '@gitborlando/utils/browser'
import { EditorSetting, getEditorSetting } from 'src/editor/editor/setting'
import { minMax } from 'src/editor/math/base'
import { Matrix } from 'src/editor/math/matrix'
import { Surface } from 'src/editor/render/surface'

const createInitBound = () => ({
  left: 240,
  top: 48,
  right: 240,
  bottom: 0,
  width: window.innerWidth - 240 - 240,
  height: window.innerHeight - 48 - 0,
})

class StageViewportService {
  @observable.ref matrix = Matrix.identity()
  @observable bound = createInitBound()

  @observable zoom = 1
  @observable offset = XY._(0, 0)

  AABB = new AABB(0, 0, 0, 0)
  prevAABB = new AABB(0, 0, 0, 0)

  private prevMatrix = Matrix.identity()
  private boundAABB = new AABB(0, 0, 0, 0)
  private wheeler = new WheelUtil()
  private disposer = new Disposer()

  subscribe() {
    return Disposer.collect(
      this.onBoundChange(),
      this.onMatrixChange(),
      Surface.inited.hook(this.onWheelZoom),
      EditorSetting.inited.hook(this.devSolidZoomAndOffset),
      this.disposer.dispose,
    )
  }

  init() {
    this.onObserving()
  }

  toCanvasXY(xy: IXY) {
    return XY.from(xy).minus(XY.leftTop(this.bound))
  }
  toStageXY(xy: IXY) {
    return XY.from(this.toCanvasXY(xy)).minus(this.offset)
  }
  toSceneXY(xy: IXY) {
    return XY.from(this.toStageXY(xy)).divide(this.zoom)
  }
  toSceneShift(xy: IXY) {
    return XY.from(xy).divide(this.zoom)
  }
  toSceneMarquee(marquee: IRect) {
    return {
      ...this.toSceneXY(marquee),
      width: marquee.width / this.zoom,
      height: marquee.height / this.zoom,
    }
  }
  sceneXYToClientXY(xy: IXY) {
    return XY.from(xy)
      .multiply(this.zoom)
      .plus(this.offset)
      .plus(XY.leftTop(this.bound))
  }
  inViewport(xy: IXY) {
    const { left, top, right, bottom } = this.bound
    return xy.x > left && xy.x < right && xy.y > top && xy.y < bottom
  }

  getStepByZoom(zoom: number) {
    const steps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]
    const base = 50 / zoom
    return steps.find((i) => i >= base) || steps[0]
  }

  private deltaYToZoomStep(deltaY: number) {
    return Math.max(0.05, 0.12937973 * Math.log(Math.abs(deltaY)) - 0.33227472)
  }

  private handleWheelZoom = (e: WheelEvent) => {
    e.preventDefault()

    if (!e.ctrlKey) {
      if (e.shiftKey) {
        this.matrix = this.matrix.clone().translate(e.deltaY, 0)
      } else {
        if (e.deltaY === 0) this.matrix = this.matrix.clone().translate(-e.deltaX, 0)
        else this.matrix = this.matrix.clone().translate(0, -e.deltaY)
      }
      return
    }

    const sign = Math.sign(e.deltaY)
    const step = this.deltaYToZoomStep(e.deltaY)

    const newZoom = minMax(
      0.015625,
      256,
      sign < 0 ? this.zoom * (1 + step) : this.zoom / (1 + step),
    )
    const deltaZoom = newZoom / this.zoom

    const canvasXY = this.toCanvasXY(XY.client(e))
    this.matrix = this.matrix
      .clone()
      .translate(-canvasXY.x, -canvasXY.y)
      .scale(deltaZoom, deltaZoom)
      .translate(canvasXY.x, canvasXY.y)
  }

  private onWheelZoom() {
    this.disposer.add(
      this.wheeler.beforeWheel.hook(({ e }) => e.ctrlKey && e.preventDefault()),
      this.wheeler.duringWheel.hook(({ e }) => this.handleWheelZoom(e)),
      this.wheeler.afterWheel.hook(({ e }) => e.ctrlKey && e.preventDefault()),
      Surface.addEvent('wheel', (e) => this.wheeler.onWheel(e as WheelEvent)),
      listen('wheel', { passive: false }, (e) => e.ctrlKey && e.preventDefault()),
    )
  }

  private onMatrixChange() {
    return Disposer.collect(
      reaction(
        () => this.matrix,
        (_, prev) => (this.prevMatrix = prev.clone()),
      ),
      autorun(() => {
        this.zoom = this.matrix.a
        this.offset = XY.of(this.matrix.tx, this.matrix.ty)
        this.AABB = this.matrix.invertAABB(this.boundAABB)
        this.prevAABB = this.prevMatrix.invertAABB(this.boundAABB)
      }),
    )
  }

  private onBoundChange() {
    const setBound = action(() => {
      const { left, top, right, bottom } = this.bound
      this.bound.width = window.innerWidth - left - right
      this.bound.height = window.innerHeight - top - bottom
      this.boundAABB = new AABB(0, 0, this.bound.width, this.bound.height)
    })
    setBound()
    return listen('resize', setBound)
  }

  private onObserving() {
    return Disposer.collect(
      autorun(() => (YClients.client.viewportMatrix = this.matrix.tuple())),
      autorun(() => {
        const client = YClients.observingClient
        if (!client) return
      }),
    )
  }

  @action
  private devSolidZoomAndOffset() {
    const { solidZoomAndOffset, matrix } = getEditorSetting().dev
    if (solidZoomAndOffset) this.matrix = Matrix.of(...matrix)
  }
}

export const StageViewport = autoBind(makeObservable(new StageViewportService()))

export const getZoom = () => StageViewport.zoom
