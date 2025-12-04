import { listen, WheelUtil } from '@gitborlando/utils/browser'
import { EditorSetting, getEditorSetting } from 'src/editor/editor/setting'
import { IRect } from 'src/editor/math'
import { minMax } from 'src/editor/math/base'
import { Matrix } from 'src/editor/math/matrix'
import { StageSurface } from 'src/editor/render/surface'

const createInitBound = () => ({
  left: 240,
  top: 48,
  right: 240,
  bottom: 0,
  width: window.innerWidth - 240 - 240,
  height: window.innerHeight - 48 - 0,
})

class StageViewportService {
  @observable.ref sceneMatrix = Matrix.identity()
  @observable bound = createInitBound()

  @observable zoom = 1
  @observable offset = XY._(0, 0)
  @observable isZooming = false

  sceneAABB = new AABB(0, 0, 0, 0)
  prevSceneAABB = new AABB(0, 0, 0, 0)

  private prevSceneMatrix = Matrix.identity()
  private boundAABB = new AABB(0, 0, 0, 0)
  private wheeler = new WheelUtil()
  private disposer = new Disposer()

  subscribe() {
    return Disposer.collect(
      this.onBoundChange(),
      this.onMatrixChange(),
      StageSurface.inited.hook(this.onWheelZoom),
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

  updateZoom(newZoom: number, center?: IXY) {
    const { width, height } = this.bound
    center ||= XY.of(width / 2, height / 2)

    newZoom = minMax(0.015625, 256, newZoom)
    const deltaZoom = newZoom / this.zoom

    this.sceneMatrix = this.sceneMatrix
      .clone()
      .translate(-center.x, -center.y)
      .scale(deltaZoom, deltaZoom)
      .translate(center.x, center.y)
  }

  private deltaYToZoomStep(deltaY: number) {
    return Math.max(0.05, 0.12937973 * Math.log(Math.abs(deltaY)) - 0.33227472)
  }

  private handleWheelZoom = (e: WheelEvent) => {
    e.preventDefault()

    if (!e.ctrlKey) {
      if (e.shiftKey) {
        this.sceneMatrix = this.sceneMatrix.clone().translate(e.deltaY, 0)
      } else {
        if (e.deltaY === 0)
          this.sceneMatrix = this.sceneMatrix.clone().translate(-e.deltaX, 0)
        else this.sceneMatrix = this.sceneMatrix.clone().translate(0, -e.deltaY)
      }
      return
    }

    const sign = Math.sign(e.deltaY)
    const step = this.deltaYToZoomStep(e.deltaY)
    const newZoom = minMax(0.015625, 256, this.zoom / (1 + step) ** sign)

    this.updateZoom(newZoom, this.toCanvasXY(XY.client(e)))
  }

  private onWheelZoom() {
    this.disposer.add(
      this.wheeler.beforeWheel.hook(({ e }) => {
        this.isZooming = true
      }),
      this.wheeler.duringWheel.hook(({ e }) => {
        this.handleWheelZoom(e)
      }),
      this.wheeler.afterWheel.hook(({ e }) => {
        this.isZooming = false
      }),
      StageSurface.addEvent('wheel', (e) => {
        this.wheeler.onWheel(e as WheelEvent)
      }),
      listen('wheel', { passive: false, capture: true }, (e) => {
        e.ctrlKey && e.preventDefault()
      }),
    )
  }

  private onMatrixChange() {
    return Disposer.collect(
      reaction(
        () => this.sceneMatrix,
        (_, prev) => (this.prevSceneMatrix = prev.clone()),
      ),
      autorun(() => {
        this.zoom = this.sceneMatrix.a
        this.offset = XY.of(this.sceneMatrix.tx, this.sceneMatrix.ty)
        this.sceneAABB = this.sceneMatrix.invertAABB(this.boundAABB)
        this.prevSceneAABB = this.prevSceneMatrix.invertAABB(this.boundAABB)
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
      autorun(() => {
        YClients.client.sceneMatrix = this.sceneMatrix.tuple()
      }),
      autorun(() => {
        const client = YClients.observingClient
        if (!client) return
      }),
    )
  }

  @action
  private devSolidZoomAndOffset() {
    const { fixedSceneMatrix, sceneMatrix } = getEditorSetting().dev
    if (fixedSceneMatrix) this.sceneMatrix = Matrix.of(...sceneMatrix)
  }
}

export const StageViewport = autoBind(makeObservable(new StageViewportService()))

export const getZoom = () => StageViewport.zoom
