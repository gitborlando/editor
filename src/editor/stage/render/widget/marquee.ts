import autobind from 'class-autobind-decorator'
import { floor } from 'src/editor/math/base'
import { StageSelect } from 'src/editor/stage/interact/select'
import { Elem } from 'src/editor/stage/render/elem'
import { StageScene } from 'src/editor/stage/render/scene'
import { Surface } from 'src/editor/stage/render/surface'
import { StageViewport } from 'src/editor/stage/viewport'
import { hslBlueColor } from 'src/shared/utils/color'

@autobind
class StageWidgetMarqueeService {
  marqueeElement = new Elem()
  initHook() {
    this.marqueeElement.draw = () => {
      if (!StageSelect.marquee.value) return

      let { x, y, width, height } = StageSelect.marquee.value
      x = floor(x) + 0.5
      y = floor(y + 0.5)

      Surface.ctxSaveRestore((ctx) => {
        ctx.strokeStyle = hslBlueColor(65)
        ctx.lineWidth = 1 / StageViewport.zoom.value / devicePixelRatio
        ctx.fillStyle = hslBlueColor(65).replace('1)', '0.1)')
        ctx.fillRect(x, y, width, height)
        ctx.strokeRect(x, y, width, height)
      })
    }

    StageScene.widgetRoot.addChild(this.marqueeElement)

    StageSelect.marquee.hook(() => {
      Surface.requestRender()
      Surface.collectDirty(this.marqueeElement)
    })
  }
}

export const StageWidgetMarquee = new StageWidgetMarqueeService()
