import autobind from 'class-autobind-decorator'

@autobind
class UIOperatePanelService {
  showPicker = Signal.create(false)
  init() {}
}

export const UIOperatePanel = new UIOperatePanelService()
