import autobind from 'class-autobind-decorator'

@autobind
class UIRightPanelService {
  currentTab = Signal.create<'operate' | 'development'>('operate')
  init() {}
}

export const UIRightPanel = new UIRightPanelService()
