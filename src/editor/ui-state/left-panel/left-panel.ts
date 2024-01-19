import autobind from 'class-autobind-decorator'
import { StageViewport } from '~/editor/stage/viewport'
import { Setting } from '~/global/setting'
import { createSignal } from '~/shared/signal'

@autobind
export class UILeftPanelService {
  panelHeight = createSignal(0)
  switchBarSize = createSignal(36)
  switchTag = createSignal(<'layer' | 'component' | 'source'>'layer')
  get switchBarPosition() {
    return Setting.switchBarPosition
  }
  init() {
    const originX = StageViewport.bound.value.x
    this.switchBarPosition.hook(
      (value, oldValue) => {
        if (value === 'top') {
          this.switchBarSize.dispatch(36)
          this.panelHeight.value =
            window.innerHeight - StageViewport.bound.value.y - this.switchBarSize.value
          StageViewport.bound.value.x = originX
        }
        if (value === 'left') {
          this.panelHeight.value = window.innerHeight - StageViewport.bound.value.y
          this.switchBarSize.dispatch(40)
          if (oldValue === 'top') {
            StageViewport.bound.value.x = originX + this.switchBarSize.value
          }
        }
        StageViewport.bound.dispatch()
        this.panelHeight.dispatch()
      },
      ['immediately']
    )
  }
}

export const UILeftPanel = new UILeftPanelService()
