import { matchCase, NoopFunc } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'
import { StageCreate } from './create'
import { StageMove } from './move'
import { StageSelect } from './select'

export type IStageInteraction = 'select' | 'move' | 'create'

@autobind
class StageInteractService {
  @observable interaction: IStageInteraction = 'select'
  private disposer?: NoopFunc

  init() {
    this.onInteract()
  }

  dispose() {
    this.disposer?.()
  }

  private onInteract() {
    autorun(() => {
      this.disposer?.()

      const interact = matchCase(this.interaction, {
        select: () => StageSelect.startInteract(),
        move: () => StageMove.startInteract(),
        create: () => StageCreate.startInteract(),
      })

      this.disposer = interact()
    })
  }
}

export const StageInteract = makeObservable(new StageInteractService())
