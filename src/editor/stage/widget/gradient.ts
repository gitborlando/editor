import autobind from 'class-autobind-decorator'
import { Graphics } from 'pixi.js'
import { IFillLinearGradient } from '~/editor/schema/type'
import { UIPicker } from '~/editor/ui-state/right-planel/operate/picker'
import { PIXI } from '../pixi'

@autobind
export class StageWidgetGradientService {
  gradientElement = new PIXI.Graphics()
  initHook() {
    UIPicker.show.hook(() => {
      if (UIPicker.type.value === 'linearGradient') this.drawLinear()
    })
  }
  drawLinear() {
    const { currentLinearFill: currentLinearGradientFill } = UIPicker
    const { start, end, stops } = currentLinearGradientFill.value
  }
  private createPointer(fill: IFillLinearGradient) {
    const { start, stops, end } = fill
    const startPoint = new Graphics()
    const endPoint = new Graphics()
    startPoint.width = 12
    startPoint.height = 12
    startPoint.beginFill('white')
    endPoint.width = 12
    endPoint.height = 12
    endPoint.beginFill('white')
  }
}

export const StageWidgetGradient = new StageWidgetGradientService()
