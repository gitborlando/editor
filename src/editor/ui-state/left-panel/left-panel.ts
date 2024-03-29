import autobind from 'class-autobind-decorator'
import { FC } from 'react'
import { StageViewport } from '~/editor/stage/viewport'
import { createSetting } from '~/global/setting'
import { createSignal } from '~/shared/signal'
import { DiffComp } from '~/view/editor/left-panel/panels/diff/diff'
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
  popupTabIds = createSetting('Editor.LeftPanel.popupTabIds', new Set<string>())
  showLeftPanel = createSetting('Editor.LeftPanel.showLeftPanel', true)
  panelHeight = window.innerHeight - 48
  switchTabIds = <string[]>[]
  initHook() {
    this.switchTabMap.hook(() => {
      this.switchTabIds = [...this.switchTabMap.value.keys()]
    })
  }
  init() {
    this.showLeftPanel.hook(
      (show) => StageViewport.bound.dispatch((bound) => (bound.x = show ? 280 : 40)),
      ['immediately']
    )
    // this.registerSwitchTab({
    //   id: 'file',
    //   name: '文件',
    //   icon: Asset.editor.leftPanel.switchBar.file,
    //   panel: FileComp,
    // })
    this.registerSwitchTab({
      id: 'layer',
      name: '图层',
      icon: Asset.editor.leftPanel.switchBar.layer,
      panel: LayerComp,
    })
    // this.registerSwitchTab({
    //   id: 'component',
    //   name: '组件',
    //   icon: Asset.editor.leftPanel.switchBar.component,
    //   panel: () => '',
    // })
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
    this.registerSwitchTab({
      id: 'diff',
      name: 'Diff',
      icon: Asset.editor.leftPanel.switchBar.record,
      panel: DiffComp,
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
