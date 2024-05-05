import autobind from 'class-autobind-decorator'
import { createSignal } from '~/shared/signal/signal'

@autobind
class UIRightPanelService {
  currentTab = createSignal<'operate' | 'development'>('operate')
  init() {}
}

export const UIRightPanel = new UIRightPanelService()
