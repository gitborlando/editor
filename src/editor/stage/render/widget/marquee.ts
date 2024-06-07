import autobind from 'class-autobind-decorator'
import { OBB } from 'src/editor/math/obb'
import { StageSelect } from 'src/editor/stage/interact/select'
import { Elem } from 'src/editor/stage/render/elem'
import { StageScene } from 'src/editor/stage/render/scene'
import { Surface } from 'src/editor/stage/render/surface'
import { StageViewport } from 'src/editor/stage/viewport'
import { hslBlueColor } from 'src/shared/utils/color'

@autobind
class StageWidgetMarqueeService {
  marqueeElem = new Elem('marquee')

  initHook() {
    StageScene.widgetRoot.addChild(this.marqueeElem)

    this.marqueeElem.draw = () => {
      const { x, y, width, height } = this.marqueeElem.obb
      if (width === 0 && height === 0) return

      Surface.ctxSaveRestore((ctx) => {
        ctx.strokeStyle = hslBlueColor(65)
        ctx.lineWidth = 1 / StageViewport.zoom.value / devicePixelRatio
        ctx.fillStyle = hslBlueColor(65).replace('1)', '0.1)')
        ctx.fillRect(x, y, width, height)
        ctx.strokeRect(x, y, width, height)
      })
    }

    StageSelect.marquee.hook((marquee) => {
      Surface.collectDirtyRect(this.marqueeElem.aabb, 2)

      if (!marquee) {
        this.marqueeElem.obb = OBB.IdentityOBB()
        return
      }

      this.marqueeElem.obb = OBB.FromRect(marquee)
      Surface.collectDirtyRect(this.marqueeElem.aabb, 2)
    })
  }
}

export const StageWidgetMarquee = new StageWidgetMarqueeService()
