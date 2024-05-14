import autobind from 'class-autobind-decorator'
import hotkeys from 'hotkeys-js'
import { IImmuiPatch } from '~/shared/immui/immui'
import { createSignal } from '~/shared/signal/signal'
import { addListener } from '~/shared/utils/event'
import { Schema } from '../schema/schema'
import { ICommand, commands } from './command'

@autobind
export class EditorService {
  commands = commands
  onReviewSchema = createSignal<IImmuiPatch>()
  private lastOperationLength = 0
  initHook() {
    this.bindHotkeys()
    this.reviewSchema()
  }
  private reviewSchema() {
    Schema.schemaChanged.hook({ beforeAll: true }, () => {
      const patches = Schema.operationList
        .slice(this.lastOperationLength)
        .map((operation) => operation.patches)
      patches.flat().forEach((patch) => {
        this.onReviewSchema.dispatch(patch)
      })
      this.lastOperationLength = Schema.operationList.length
    })
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
