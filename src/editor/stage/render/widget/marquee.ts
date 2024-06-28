import autobind from 'class-autobind-decorator'
import { OBB } from 'src/editor/math/obb'
import { Elem } from 'src/editor/stage/render/elem'
import { StageScene } from 'src/editor/stage/render/scene'
import { Surface } from 'src/editor/stage/render/surface'
import { StageViewport } from 'src/editor/stage/viewport'
import { Drag } from 'src/global/event/drag'
import { createSignal } from 'src/shared/signal/signal'
import { hslBlueColor } from 'src/shared/utils/color'
import { IRect } from 'src/shared/utils/normal'

@autobind
class StageMarqueeService {
  marqueeElem = new Elem('marquee', 'widgetElem')
  marquee: IRect = { x: 0, y: 0, width: 0, height: 0 }

  duringMarquee = createSignal<IRect>()
  afterMarquee = createSignal()

  initHook() {
    this.setupMarqueeElem()
  }

  startMarquee() {
    Surface.disablePointEvent()

    Drag.onStart()
      .onMove(({ marquee }) => {
        this.marquee = StageViewport.toSceneMarquee(marquee)
        this.resetMarqueeElemOBB()
        this.duringMarquee.dispatch(this.marquee)
      })
      .onDestroy(() => {
        this.marquee = { x: 0, y: 0, width: 0, height: 0 }
        this.resetMarqueeElemOBB()
        this.afterMarquee.dispatch()
        this.duringMarquee.removeAll()
        this.afterMarquee.removeAll()
      })
  }

  private setupMarqueeElem() {
    StageScene.widgetRoot.addChild(this.marqueeElem)

    this.marqueeElem.getDirtyRect = (expand) => expand(this.marqueeElem.aabb, 2)

    this.marqueeElem.draw = () => {
      const { x, y, width, height } = this.marqueeElem.obb
      if (width === 0 && height === 0) return

      Surface.ctxSaveRestore((ctx) => {
        ctx.strokeStyle = hslBlueColor(65)
        ctx.lineWidth = 1 / StageViewport.zoom$.value / devicePixelRatio
        ctx.fillStyle = hslBlueColor(65).replace('1)', '0.1)')
        ctx.fillRect(x, y, width, height)
        ctx.strokeRect(x, y, width, height)
      })
    }
  }

  private resetMarqueeElemOBB() {
    Surface.collectDirty(this.marqueeElem)
    this.marqueeElem.obb = OBB.FromRect(this.marquee)
    Surface.collectDirty(this.marqueeElem)
  }
}

export const StageMarquee = new StageMarqueeService()
