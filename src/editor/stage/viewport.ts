import { IRect, IXY, max, XY } from '@gitborlando/geo'
import { WheelUtil } from '@gitborlando/utils/browser'
import autobind from 'class-autobind-decorator'
import hotkeys from 'hotkeys-js'
import { Surface } from 'src/editor/stage/render/surface'

const createInitBound = () => ({
  left: 280,
  top: 44,
  right: 240,
  bottom: 0,
  width: window.innerWidth - 280 - 240,
  height: window.innerHeight - 44 - 0,
})

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
  @observable zoom = 1
  @observable offset = XY._(0, 0)
  @observable bound = createInitBound()

  private wheeler = new WheelUtil()

  init() {
    this.onResizeBound()
    Surface.inited$.hook(() => {
      this.onWheelZoom()
    })
  }

  toViewportXY(xy: IXY) {
    return XY.from(xy).minus(XY.leftTop(this.bound))
  }
  toStageXY(xy: IXY) {
    return XY.from(this.toViewportXY(xy)).minus(this.offset)
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

  //   centerStage() {
  //     let allElemsAABB = new AABB(0, 0, 0, 0)

  //     const traverse = (elem: Elem) => {
  //       allElemsAABB = AABB.Merge([allElemsAABB, elem.aabb])
  //       elem.children.forEach(traverse)
  //     }
  //     Surface.layerList.forEach((elem) => elem.children.forEach(traverse))

  //     const allElemsRect = AABB.Rect(allElemsAABB)
  //     const viewportRect = AABB.Rect(Surface.viewportAABB)

  //     if (allElemsRect.width > viewportRect.width || allElemsRect.height > viewportRect.height) {
  //       const zoom = Math.min(
  //         viewportRect.width / allElemsRect.width,
  //         viewportRect.height / allElemsRect.height,
  //       )
  //       const shift = xy_multiply(
  //         xy_minus(xy_center(viewportRect), xy_center(allElemsRect)),
  //         zoom / getZoom(),
  //       )

  //       this.zoom$.dispatch(zoom)
  //       this.offset$.dispatch((offset) => xy_plus(offset, shift))
  //       this.zoomingStage$.dispatch()
  //     } else {
  //       const shift = xy_minus(xy_center(viewportRect), xy_center(allElemsRect))

  //       this.offset$.dispatch((offset) => xy_plus(offset, shift))
  //       this.movingStage$.dispatch()
  //     }
  //   }
}

export const StageViewport = makeObservable(new StageViewportService())

export const getZoom = () => StageViewport.zoom
