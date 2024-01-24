import autobind from 'class-autobind-decorator'
import { FC } from 'react'
import { StageViewport } from '~/editor/stage/viewport'
import { Setting } from '~/global/setting'
import { createSignal } from '~/shared/signal'
import { GalleryComp } from '~/view/editor/left-panel/panels/gallery/gallery'
import { LayerComp } from '~/view/editor/left-panel/panels/layer/layer'
import { RecordComp } from '~/view/editor/left-panel/panels/record/record'
import Asset from '~/view/ui-utility/assets'

type ISwitchTabOption = {
  id: string
  name: string
  icon: FC<any>
  panel: FC<any>
}

@autobind
export class UILeftPanelService {
  currentTabId = createSignal('layer')
  switchTabMap = createSignal(new Map<string, ISwitchTabOption>())
  popupTabIds = createSignal(new Set<string>())
  switchTabIds = <string[]>[]
  panelHeight = window.innerHeight - 48
  get showLeftPanel() {
    return Setting.showLeftPanel
  }
  initHook() {
    this.switchTabMap.hook(() => {
      this.switchTabIds = [...this.switchTabMap.value.keys()]
    })
  }
  init() {
    Setting.showLeftPanel.hook(
      (show) => StageViewport.bound.dispatch((bound) => (bound.x = show ? 280 : 40)),
      ['immediately']
    )
    this.registerSwitchTab({
      id: 'layer',
      name: '图层',
      icon: Asset.editor.leftPanel.switchBar.layer,
      panel: LayerComp,
    })
    this.registerSwitchTab({
      id: 'component',
      name: '组件',
      icon: Asset.editor.leftPanel.switchBar.component,
      panel: () => '',
    })
    this.registerSwitchTab({
      id: 'source',
      name: '图片',
      icon: Asset.editor.leftPanel.switchBar.image,
      panel: GalleryComp,
    })
    this.registerSwitchTab({
      id: 'record',
      name: '记录',
      icon: Asset.editor.leftPanel.switchBar.record,
      panel: RecordComp,
    })
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
  popupCurrentPanel() {
    this.popupTabIds.dispatch((ids) => ids.add(this.currentTabId.value))
    this.currentTabId.dispatch(this.switchTabIds.find((id) => !this.popupTabIds.value.has(id)))
  }
}

export const UILeftPanel = new UILeftPanelService()
