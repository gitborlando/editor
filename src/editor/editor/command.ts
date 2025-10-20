import hotkeys from 'hotkeys-js'
import { EditorSetting } from 'src/editor/editor/setting'
import { SchemaHistory } from 'src/editor/schema/history'
import { StageInteract } from 'src/editor/stage/interact/interact'
import { StageScene } from 'src/editor/stage/render/scene'
import { Menu } from 'src/global/menu'
import { listen } from 'src/shared/utils/event'
import { IAnyObject } from 'src/shared/utils/normal'
import { OperateNode, getSelectIds } from '../operate/node'
import { OperatePage } from '../operate/page'
import { Schema } from '../schema/schema'
import { ID, INodeParent, IPage, ISchemaItem } from '../schema/type'
import { UILeftPanelLayer } from '../ui-state/left-panel/layer'
import { UILeftPanel } from '../ui-state/left-panel/left-panel'

export type IEditorCommand = {
  name?: string
  callback: (context?: IAnyObject) => any
  shortcut?: string
  children?: IEditorCommand[][]
}

class EditorCommandManager {
  initHook() {
    this.bindHotkeys()
  }

  get copyPasteGroup(): IEditorCommand[] {
    return [
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
    ]
  }

  get undoRedoGroup(): IEditorCommand[] {
    return [
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
    ]
  }

  get pageGroup(): IEditorCommand[] {
    const commands = [
      {
        name: '删除页面',
        callback: () => {
          const { id } = Menu.context
          this.deletePage(id)
        },
      },
    ]

    if (EditorSetting.setting.devMode) {
      commands.push({
        name: '打印 schema',
        callback: () => {
          const { id } = Menu.context
          this.logPageSchema(id)
        },
      })
    }

    return commands
  }

  get nodeGroup(): IEditorCommand[] {
    const commands = [
      {
        name: '重命名',
        callback: () => {
          const { id } = Menu.context
          UILeftPanelLayer.enterReName.dispatch(id)
        },
      },
      {
        name: '创建画板',
        callback: () => OperateNode.wrapInFrame(),
      },
      {
        name: '删除',
        shortcut: 'del',
        callback: () => OperateNode.deleteSelectNodes(),
      },
    ]

    if (EditorSetting.setting.devMode) {
      commands.push(
        {
          name: '打印 schema',
          callback: () => {
            getSelectIds().forEach((id) => {
              console.log(Schema.find(id))
            })
          },
        },
        {
          name: '打印 elem',
          callback: () => {
            getSelectIds().forEach((id) => {
              console.log(StageScene.findElem(id))
            })
          },
        },
      )
    }

    return commands
  }

  get nodeReHierarchyGroup(): IEditorCommand[] {
    return [
      {
        name: '上移',
        shortcut: 'ctrl+]',
        callback: () => this.reHierarchy('up'),
      },
      {
        name: '下移',
        shortcut: 'ctrl+[',
        callback: () => this.reHierarchy('down'),
      },
      {
        name: '移至顶部',
        shortcut: 'ctrl+alt+]',
        callback: () => this.reHierarchy('top'),
      },
      {
        name: '移至底部',
        shortcut: 'ctrl+alt+[',
        callback: () => this.reHierarchy('bottom'),
      },
    ]
  }

  get UIleftPanelSwitchBarGroup(): IEditorCommand[] {
    return [
      {
        name: '弹出面板',
        callback: () => {
          const { id } = Menu.context
          UILeftPanel.popUpPanel(id)
        },
      },
    ]
  }

  get createShapeGroup(): IEditorCommand[] {
    return [
      {
        shortcut: 'v',
        callback: () => StageInteract.currentType.dispatch('select'),
      },
      {
        shortcut: 'h',
        callback: () => StageInteract.currentType.dispatch('move'),
      },
    ]
  }

  get fileGroup(): IEditorCommand[] {
    return [
      {
        name: '删除文件',
        callback: () => {
          const { id } = Menu.context
        },
      },
      {
        name: '导出文件',
        callback: () => {
          const { id } = Menu.context
        },
      },
    ]
  }

  private bindHotkeys = () => {
    let isKeyDown = false
    const commandList = [
      this.copyPasteGroup,
      this.undoRedoGroup,
      this.pageGroup,
      this.nodeGroup,
      this.nodeReHierarchyGroup,
      this.UIleftPanelSwitchBarGroup,
      this.createShapeGroup,
      this.fileGroup,
    ].flat() as IEditorCommand[]

    commandList.forEach(({ shortcut, callback }) => {
      if (!shortcut) return

      hotkeys(shortcut!, (keyboardEvent) => {
        keyboardEvent.preventDefault()
        if (['ctrl+c'].includes(shortcut!)) {
          if (isKeyDown) return
          isKeyDown = true
        }
        callback()
      })
    })

    listen('keyup', () => (isKeyDown = false))
    listen('keydown', (e) => {
      if (e.altKey) e.preventDefault()
    })
  }

  private reHierarchy(type: 'up' | 'down' | 'top' | 'bottom') {
    OperateNode.selectedNodes.value.forEach((node) => {
      const parent = Schema.find<INodeParent>(node.parentId)
      let index = parent.childIds.indexOf(node.id)
      index = (() => {
        if (type === 'up') return index - 1
        if (type === 'down') return index + 1
        if (type === 'top') return 0
        return parent.childIds.length - 1
      })()
      OperateNode.reHierarchy(parent, node, index)
    })
    Schema.finalOperation('重新排序')
  }

  private deletePage(id: ID) {
    const pageIds = Schema.meta.pageIds
    const index = Schema.meta.pageIds.indexOf(id)
    const next = pageIds[index + 1]
    const prev = pageIds[index - 1]
    if (!(next || prev)) return

    OperatePage.removePage(Schema.find<IPage>(id))
    OperatePage.selectPage(next || prev)
    Schema.nextSchema()
  }

  private logPageSchema(id: ID) {
    const curPage = Schema.find<IPage>(id)
    const nodes: Record<ID, ISchemaItem> = {}
    const findNodes = (id: string) => {
      const node = Schema.find(id)
      nodes[node.id] = node
      if ('childIds' in node) {
        node.childIds.map(Schema.find).forEach((node) => (nodes[node.id] = node))
      }
    }
    curPage.childIds.forEach(findNodes)
    console.log({
      meta: Schema.meta,
      client: Schema.client,
      page: curPage,
      ...nodes,
    })
  }
}

export const EditorCommand = new EditorCommandManager()
