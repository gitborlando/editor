import autobind from 'class-autobind-decorator'
import { FC } from 'react'
import { StageViewport } from '~/editor/stage/viewport'
import { createSetting } from '~/global/setting'
import { createSignal } from '~/shared/signal/signal'
import { FileComp } from '~/view/editor/left-panel/panels/file/file'
import { GalleryComp } from '~/view/editor/left-panel/panels/gallery'
import { HistoryComp } from '~/view/editor/left-panel/panels/history'
import { LayerComp } from '~/view/editor/left-panel/panels/layer/layer'
import Asset from '~/view/ui-utility/assets'

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
  popupTabIds = createSetting('Editor.LeftPanel.popupTabIds', new Set<string>())
  showLeftPanel = createSetting('Editor.LeftPanel.showLeftPanel', true)
  panelHeight = window.innerHeight - 48
  switchTabIds = <string[]>[]
  initHook() {
    this.showLeftPanel.hook({ immediately: true }, (show) =>
      StageViewport.bound.dispatch((bound) => (bound.x = show ? 280 : 40))
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

UILeftPanel.switchTabMap.hook(() => {
  UILeftPanel.switchTabIds = [...UILeftPanel.switchTabMap.value.keys()]
})
UILeftPanel.registerSwitchTab({
  id: 'file',
  name: '文件',
  icon: Asset.editor.leftPanel.switchBar.file,
  panel: FileComp,
})
UILeftPanel.registerSwitchTab({
  id: 'layer',
  name: '图层',
  icon: Asset.editor.leftPanel.switchBar.layer,
  panel: LayerComp,
})
// UILeftPanel.registerSwitchTab({
//   id: 'component',
//   name: '组件',
//   icon: Asset.editor.leftPanel.switchBar.component,
//   panel: () => '',
// })
UILeftPanel.registerSwitchTab({
  id: 'source',
  name: '图片',
  icon: Asset.editor.leftPanel.switchBar.image,
  panel: GalleryComp,
})
// UILeftPanel.registerSwitchTab({
//   id: 'record',
//   name: '记录',
//   icon: Asset.editor.leftPanel.switchBar.record,
//   panel: RecordComp,
// })
UILeftPanel.registerSwitchTab({
  id: 'history',
  name: '历史',
  icon: Asset.editor.leftPanel.switchBar.record,
  panel: HistoryComp,
})
