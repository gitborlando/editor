import autobind from 'class-autobind-decorator'
import { createSignal } from '~/shared/signal/signal'

@autobind
class UIOperatePanelService {
  showPicker = createSignal(false)
  init() {}
}

export const UIOperatePanel = new UIOperatePanelService()
