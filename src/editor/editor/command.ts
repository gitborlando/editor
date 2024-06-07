import { SchemaHistory } from 'src/editor/schema/history'
import { Menu } from 'src/global/menu'
import { lastOne } from 'src/shared/utils/array'
import { IAnyFunc, iife } from 'src/shared/utils/normal'
import { OperateNode } from '../operate/node'
import { OperatePage } from '../operate/page'
import { Schema } from '../schema/schema'
import { INode, INodeParent, IPage } from '../schema/type'
import { UILeftPanelLayer } from '../ui-state/left-panel/layer'
import { UILeftPanel } from '../ui-state/left-panel/left-panel'

export type IEditorCommand = {
  name: string
  callback: IAnyFunc
  shortcut?: string
  children?: IEditorCommand[][]
}

export const editorCommands = {
  copyPasteGroup: [
    {
      name: '复制',
      shortcut: 'ctrl+c',
      callback: () => OperateNode.copySelectNodes(),
    },
    {
      name: '黏贴',
      shortcut: 'ctrl+v',
      callback: () => OperateNode.paste(),
    },
  ],
  undoRedoGroup: [
    {
      name: '撤销',
      shortcut: 'ctrl+z',
      callback: () => SchemaHistory.undo(),
    },
    {
      name: '重做',
      shortcut: 'ctrl+shift+z',
      callback: () => SchemaHistory.redo(),
    },
  ],
  pageGroup: [
    {
      name: '删除页面',
      callback: () => {
        const { id } = Menu.context
        OperatePage.removePage(Schema.find<IPage>(id))
      },
    },
  ],
  nodeGroup: [
    {
      name: '重命名',
      callback: () => {
        const { id } = Menu.context
        UILeftPanelLayer.enterReName.dispatch(id)
      },
    },
    {
      name: '删除',
      shortcut: 'del',
      callback: () => OperateNode.deleteSelectNodes(),
    },
  ],
  nodeReHierarchyGroup: [
    {
      name: '上移',
      shortcut: 'ctrl+]',
      callback: () => reHierarchy('up'),
    },
    {
      name: '下移',
      shortcut: 'ctrl+[',
      callback: () => reHierarchy('down'),
    },
    {
      name: '移至顶部',
      shortcut: 'ctrl+alt+]',
      callback: () => reHierarchy('top'),
    },
    {
      name: '移至底部',
      shortcut: 'ctrl+alt+[',
      callback: () => reHierarchy('bottom'),
    },
  ],
  UIleftPanelSwitchBarGroup: [
    {
      name: '弹出面板',
      callback: () => {
        const { id } = Menu.context
        UILeftPanel.popUpPanel(id)
      },
    },
  ],
}

function getSelectNodesOrHoverNodes() {
  return OperateNode.selectedNodes.value.length
    ? OperateNode.selectedNodes.value
    : [Schema.find<INode>(lastOne(OperateNode.hoverIds.value))]
}

function reHierarchy(type: 'up' | 'down' | 'top' | 'bottom') {
  getSelectNodesOrHoverNodes().forEach((node) => {
    const parent = Schema.find<INodeParent>(node.parentId)
    let index = parent.childIds.indexOf(node.id)
    index = iife(() => {
      if (type === 'up') return index - 1
      if (type === 'down') return index + 1
      if (type === 'top') return 0
      return parent.childIds.length - 1
    })
    OperateNode.reHierarchy(parent, node, index)
  })
  Schema.finalOperation('重新排序')
}
