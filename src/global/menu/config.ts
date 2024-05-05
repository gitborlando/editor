import { SchemaHistory } from '~/editor/schema/history'
import { SchemaUtil } from '~/editor/schema/util'
import { UILeftPanelLayer } from '~/editor/ui-state/left-panel/layer'
import { UILeftPanel } from '~/editor/ui-state/left-panel/left-panel'
import { noopFunc } from '~/shared/utils/normal'
import { IMenuItem, Menu } from './menu'

export const menuConfig = <const>{
  copyPasteGroup: <IMenuItem[]>[
    {
      label: '复制',
      shortcut: 'ctrl+c',
      callback: noopFunc,
    },
    {
      label: '黏贴',
      shortcut: 'ctrl+v',
      callback: noopFunc,
    },
  ],
  undoRedoGroup: <IMenuItem[]>[
    {
      label: '撤销',
      shortcut: 'ctrl+z',
      callback: SchemaHistory.undo,
    },
    {
      label: '重做',
      shortcut: 'ctrl+shift+z',
      callback: SchemaHistory.redo,
    },
  ],
  pageGroup: <IMenuItem[]>[
    {
      label: '删除页面',
      callback: () => {
        const { id } = Menu.context
        // SchemaPage.delete(SchemaPage.find(id)!)
      },
    },
  ],
  nodeGroup: <IMenuItem[]>[
    {
      label: '重命名',
      callback: () => {
        const { id } = Menu.context
        UILeftPanelLayer.enterReName.dispatch(id)
      },
    },
    {
      label: '删除',
      shortcut: 'del',
      callback: SchemaUtil.deleteSelectNodes,
    },
  ],
  UIleftPanelSwitchBarGroup: <IMenuItem[]>[
    {
      label: '弹出面板',
      callback: () => {
        const { id } = Menu.context
        UILeftPanel.popUpPanel(id)
      },
    },
  ],
}
