import { autobind } from '~/shared/decorator'
import { createSignal } from '~/shared/signal'

@autobind
export class UIRightPanelService {
  currentTab = createSignal<'operate' | 'development'>('operate')
  init() {}
}

export const UIRightPanel = new UIRightPanelService()
