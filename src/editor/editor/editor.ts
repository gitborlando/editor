import autobind from 'class-autobind-decorator'
import hotkeys from 'hotkeys-js'
import { addListener } from '~/shared/utils/event'
import { ICommand, commands } from './command'

@autobind
export class EditorService {
  commands = commands
  initHook() {
    this.bindHotkeys()
  }
  private bindHotkeys() {
    let isKeyDown = false
    const commands = Object.values(this.commands).flat() as ICommand[]
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
