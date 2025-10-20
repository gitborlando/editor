import autobind from 'class-autobind-decorator'
import { FC } from 'react'
import { StageViewport } from 'src/editor/stage/viewport'
import { createStorageItem } from 'src/global/storage'
import { createSignal } from 'src/shared/signal/signal'

type ISwitchTabOption = {
  id: string
  name: string
  icon: FC<any>
  panel: FC<any>
}

@autobind
class UILeftPanelService {
  currentTabId = createSignal('layer')
  switchTabMap = createSignal(new Map<string, ISwitchTabOption>())
  popupTabIds = createStorageItem('Editor.LeftPanel.popupTabIds', new Set<string>())
  showLeftPanel = createStorageItem('Editor.LeftPanel.showLeftPanel', true)
  panelHeight = window.innerHeight - 48
  switchTabIds = <string[]>[]
  initHook() {
    this.showLeftPanel.hook({ immediately: true }, (show) =>
      StageViewport.bound.dispatch((bound) => (bound.x = show ? 280 : 40)),
    )
  }
  registerSwitchTab(option: ISwitchTabOption) {
    this.switchTabMap.dispatch((map) => map.set(option.id, option))
  }
  findSwitchTab(id: string) {
    return this.switchTabMap.value.get(id)!
  }
  popDownPanel(id: string) {
    this.popupTabIds.dispatch((ids) => ids.delete(id))
    this.currentTabId.dispatch(id)
  }
  popUpPanel(id: string) {
    this.popupTabIds.dispatch((ids) => ids.add(id))
    if (this.currentTabId.value === id) {
      this.currentTabId.dispatch(this.switchTabIds.find((id) => !this.popupTabIds.value.has(id)))
    }
  }
}

export const UILeftPanel = new UILeftPanelService()
