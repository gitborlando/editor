import hotkeys from 'hotkeys-js'
import { getEditorSetting } from 'src/editor/editor/setting'
import { HandleNode } from 'src/editor/handle/node'
import { HandlePage } from 'src/editor/handle/page'
import { StageInteract } from 'src/editor/stage/interact/interact'
import { StageScene } from 'src/editor/stage/render/scene'
import { getSelectIdList } from 'src/editor/y-state/y-clients'
import { Command, ContextMenu } from 'src/global/context-menu'
import { listen } from 'src/shared/utils/event'

class EditorCommandManager {
  init() {
    this.bindHotkeys()
  }

  get copyPasteGroup(): Command[] {
    return [
      {
        name: '复制',
        shortcut: 'ctrl+c',
        disabled: () => !getSelectIdList().length,
        callback: () => HandleNode.copySelectedNodes(),
      },
      {
        name: '黏贴',
        shortcut: 'ctrl+v',
        disabled: () => !HandleNode.copiedIds.length,
        callback: () => HandleNode.pasteNodes(),
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
        callback: ({ id }: { id: ID }) => {
          HandlePage.removePage(YState.find<V1.Page>(id))
        },
      },
    ]

    if (getEditorSetting().devMode) {
      commands.push({
        name: '打印 schema',
        callback: ({ id }: { id: ID }) => {
          HandlePage.devLogPageSchema(id)
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
        callback: () => HandleNode.wrapInFrame(),
      },
      {
        name: '删除',
        shortcut: 'del',
        callback: () => HandleNode.deleteSelectedNodes(),
      },
    ]

    if (getEditorSetting().devMode) {
      commands.push(
        {
          name: '打印 schema',
          callback: () => {
            getSelectIdList().forEach((id) => {
              const node = YState.find<V1.SchemaItem>(id)
              console.log(node)
            })
          },
        },
        {
          name: '打印 elem',
          callback: () => {
            getSelectIdList().forEach((id) => {
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
        callback: () => HandleNode.reHierarchySelectedNode('up'),
      },
      {
        name: '下移',
        shortcut: 'ctrl+[',
        callback: () => HandleNode.reHierarchySelectedNode('down'),
      },
      {
        name: '移至顶部',
        shortcut: 'ctrl+alt+]',
        callback: () => HandleNode.reHierarchySelectedNode('top'),
      },
      {
        name: '移至底部',
        shortcut: 'ctrl+alt+[',
        callback: () => HandleNode.reHierarchySelectedNode('bottom'),
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
        callback({})
      })
    })

    listen('keyup', () => (isKeyDown = false))
    listen('keydown', (e) => {
      if (e.altKey) e.preventDefault()
    })
  }
}

export const EditorCommand = new EditorCommandManager()
