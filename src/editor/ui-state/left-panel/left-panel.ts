import { inject, injectable } from 'tsyringe'
import { StageViewportService, injectStageViewport } from '~/editor/stage/viewport'
import { SettingService, injectSetting } from '~/global/setting'
import { autobind } from '~/shared/decorator'
import { createSignal } from '~/shared/signal'

@autobind
@injectable()
export class UILeftPanelService {
  panelHeight = createSignal(0)
  switchBarSize = createSignal(36)
  switchTag = createSignal(<'layer' | 'component' | 'source'>'layer')
  constructor(
    @injectStageViewport private StageViewport: StageViewportService,
    @injectSetting private Setting: SettingService
  ) {
    this.Setting.inited.hook(this.init)
  }
  get switchBarPosition() {
    return this.Setting.switchBarPosition
  }
  private init() {
    const originX = this.StageViewport.bound.x
    this.switchBarPosition.immediateHook((value, oldValue) => {
      if (value === 'top') {
        this.switchBarSize.dispatch(36)
        this.panelHeight.value =
          window.innerHeight - this.StageViewport.bound.y - this.switchBarSize.value
        this.StageViewport.bound.x = originX
      }
      if (value === 'left') {
        this.panelHeight.value = window.innerHeight - this.StageViewport.bound.y
        this.switchBarSize.dispatch(40)
        if (oldValue === 'top') {
          this.StageViewport.bound.x = originX + this.switchBarSize.value
        }
      }
      this.StageViewport.needReBound.dispatch()
      this.panelHeight.dispatch()
    })
  }
}

export const injectUILeftPanel = inject(UILeftPanelService)
