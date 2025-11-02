import hotkeys from 'hotkeys-js'
import { getEditorSetting } from 'src/editor/editor/setting'
import { StageInteract } from 'src/editor/stage/interact/interact'
import { StageScene } from 'src/editor/stage/render/scene'
import { getSelectIds } from 'src/editor/y-state/y-clients'
import { Command, ContextMenu } from 'src/global/context-menu'
import { listen } from 'src/shared/utils/event'
import { OperateNode } from '../operate/node'
import { OperatePage } from '../operate/page'
import { Schema } from '../schema/schema'
import { ID, INodeParent, IPage } from '../schema/type'

class EditorCommandManager {
  initHook() {
    this.bindHotkeys()
  }

  get copyPasteGroup(): Command[] {
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

  get undoRedoGroup(): Command[] {
    return [
      {
        name: '撤销',
        shortcut: 'ctrl+z',
        callback: () => YUndo.undo(),
      },
      {
        name: '重做',
        shortcut: 'ctrl+shift+z',
        callback: () => YUndo.redo(),
      },
    ]
  }

  get pageGroup(): Command[] {
    const commands = [
      {
        name: '删除页面',
        callback: () => {
          const { id } = ContextMenu.context
          this.deletePage(id)
        },
      },
    ]

    if (getEditorSetting().devMode) {
      commands.push({
        name: '打印 schema',
        callback: () => {
          const { id } = ContextMenu.context
          this.logPageSchema(id)
        },
      })
    }

    return commands
  }

  get nodeGroup(): Command[] {
    const commands = [
      {
        name: '重命名',
        callback: () => {
          const { id } = ContextMenu.context
          // UILeftPanelLayer.enterReName.dispatch(id)
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

    if (getEditorSetting().devMode) {
      commands.push(
        {
          name: '打印 schema',
          shortcut: 'shift+n+s',
          callback: () => {
            getSelectIds().forEach((id) => {
              const node = YState.findSnap<V1.SchemaItem>(id)
              console.log(node)
            })
          },
        },
        {
          name: '打印 elem',
          shortcut: 'shift+n+e',
          callback: () => {
            getSelectIds().forEach((id) => {
              const elem = StageScene.findElem(id)
              console.log(elem)
            })
          },
        },
      )
    }

    return commands
  }

  get nodeReHierarchyGroup(): Command[] {
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

  get UIleftPanelSwitchBarGroup(): Command[] {
    return [
      {
        name: '弹出面板',
        callback: () => {
          const { id } = ContextMenu.context
          // UILeftPanel.popUpPanel(id)
        },
      },
    ]
  }

  get createShapeGroup(): Command[] {
    return [
      {
        name: '选择',
        shortcut: 'v',
        callback: () => (StageInteract.interaction = 'select'),
      },
      {
        name: '移动',
        shortcut: 'h',
        callback: () => (StageInteract.interaction = 'move'),
      },
    ]
  }

  get fileGroup(): Command[] {
    return [
      {
        name: '删除文件',
        callback: () => {
          const { id } = ContextMenu.context
        },
      },
      {
        name: '导出文件',
        callback: () => {
          const { id } = ContextMenu.context
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
    ].flat() as Command[]

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
    const curPage = YState.findSnap<V1.Page>(id)
    const nodes: Record<ID, V1.SchemaItem> = {}
    const findNodes = (id: string) => {
      const node = YState.findSnap<V1.SchemaItem>(id)
      nodes[node.id] = node
      if ('childIds' in node) {
        node.childIds.map(YState.findSnap).forEach((node) => (nodes[node.id] = node))
      }
    }
    curPage.childIds.forEach(findNodes)
    console.log({
      meta: YState.snap.meta,
      page: curPage,
      ...nodes,
    })
  }
}

export const EditorCommand = new EditorCommandManager()
