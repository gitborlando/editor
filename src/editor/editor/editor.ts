import autobind from 'class-autobind-decorator'
import hotkeys from 'hotkeys-js'
import { addListener } from '~/shared/utils/event'
import { IEditorCommand, editorCommands } from './command'

@autobind
export class EditorService {
  initHook() {
    this.bindHotkeys()
  }
  private bindHotkeys() {
    let isKeyDown = false
    const commands = Object.values(editorCommands).flat() as IEditorCommand[]
    commands.forEach(({ shortcut, callback }) => {
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
    addListener('keyup', () => (isKeyDown = false))
  }
}

export const Editor = new EditorService()
