import autobind from 'class-autobind-decorator'
import hotkeys from 'hotkeys-js'
import { IEditorCommand, editorCommands } from 'src/editor/editor/command'
import { EditorCursor } from 'src/editor/editor/cursor'
import { listen } from 'src/shared/utils/event'

@autobind
export class EditorService {
  initHook() {
    this.bindHotkeys()

    EditorCursor.initHook()
  }
  private bindHotkeys() {
    let isKeyDown = false
    const commandList = Object.values(editorCommands).flat() as IEditorCommand[]

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
}

export const Editor = new EditorService()
