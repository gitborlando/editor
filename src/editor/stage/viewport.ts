import { IRect, IXY, max, XY } from '@gitborlando/geo'
import { WheelUtil } from '@gitborlando/utils/browser'
import hotkeys from 'hotkeys-js'
import { EditorSetting, getEditorSetting } from 'src/editor/editor/setting'
import { Surface } from 'src/editor/stage/render/surface'

const createInitBound = () => ({
  left: 240,
  top: 48,
  right: 240,
  bottom: 0,
  width: window.innerWidth - 240 - 240,
  height: window.innerHeight - 48 - 0,
})

const stepByZoom = [
  [0, 0.01],
  [0.04, 0.02],
  [0.1, 0.04],
  [0.2, 0.12],
  [0.4, 0.16],
  [0.8, 0.12],
  [2.4, 0.32],
  [3.6, 1.2],
  [5, 1.6],
]

class StageViewportService {
  @observable zoom = 1
  @observable offset = XY._(0, 0)
  @observable bound = createInitBound()

  private wheeler = new WheelUtil()

  subscribe() {
    return Disposer.collect(
      Surface.inited.hook(() => {
        this.onWheelZoom()
      }),
      EditorSetting.inited.hook(() => {
        this.devSolidZoomAndOffset()
      }),
    )
  }

  init() {
    this.onResizeBound()
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
  sceneStageToClientXY(xy: IXY) {
    return XY.from(xy)
      .multiply(this.zoom)
      .plus(this.offset)
      .plus(XY.leftTop(this.bound))
  }
  inViewport(xy: IXY) {
    const { left, top, right, bottom } = this.bound
    return xy.x > left && xy.x < right && xy.y > top && xy.y < bottom
  }

  private onWheelZoom() {
    this.wheeler.beforeWheel.hook(({ e }) => {
      if (hotkeys.ctrl) e.preventDefault()
    })
    this.wheeler.duringWheel.hook(({ e }) => {
      if (!e.ctrlKey) {
        const old = { ...XY.from(this.offset) }
        if (e.shiftKey) {
          old.x -= e.deltaY
        } else {
          if (e.deltaY === 0) old.x -= e.deltaX
          else old.y -= e.deltaY
        }
        this.offset = old
        return
      }

      e.preventDefault()

      const sign = e.deltaY > 0 ? -1 : 1
      const step =
        stepByZoom.findLast(([_zoom, _step]) => _zoom <= this.zoom)![1] * sign

      const newZoom = max(0.01, this.zoom + step)
      const zoomDelta = newZoom - this.zoom

      const sceneStageXY = this.toSceneXY(XY.client(e))
      const newOffset = XY.from(sceneStageXY).multiply(-zoomDelta).plus(this.offset)

      runInAction(() => {
        this.zoom = newZoom
        this.offset = newOffset
      })
    })
    this.wheeler.afterWheel.hook(({ e }) => {
      if (hotkeys.ctrl) e.preventDefault()
    })
    Surface.addEvent('wheel', (e) => this.wheeler.onWheel(e as WheelEvent))
    window.addEventListener('wheel', (e) => e.ctrlKey && e.preventDefault(), {
      passive: false,
    })
  }

  private onResizeBound() {
    window.addEventListener(
      'resize',
      action(() => {
        const { left, top, right, bottom } = this.bound
        this.bound.width = window.innerWidth - left - right
        this.bound.height = window.innerHeight - top - bottom
      }),
    )
  }

  private onObserving() {
    autorun(() => {
      YClients.client.zoom = this.zoom
      YClients.client.offset = this.offset
    })
    autorun(() => {
      const client = YClients.observingClient
      if (!client) return

      this.zoom = client.zoom
      this.offset = client.offset
    })
  }

  @action
  private devSolidZoomAndOffset() {
    const { solidZoomAndOffset, zoom, offset } = getEditorSetting().dev
    if (solidZoomAndOffset) {
      this.zoom = zoom
      this.offset = offset
    }
  }
}

export const StageViewport = autoBind(makeObservable(new StageViewportService()))

export const getZoom = () => StageViewport.zoom
