import autobind from 'class-autobind-decorator'
import { Surface } from 'src/editor/stage/render/surface'
import { createSignal } from 'src/shared/signal/signal'

import { StageCreate } from './create'
import { StageMove } from './move'
import { StageSelect } from './select'

export type IStageInteractType = 'select' | 'move' | 'create'

@autobind
class StageInteractService {
  currentType = createSignal(<IStageInteractType>'select')
  private previousType?: IStageInteractType
  private interactHandlerMap = new Map<
    IStageInteractType,
    { startInteract: () => void; endInteract: () => void }
  >()
  initHook() {
    this.interactHandlerMap.set('create', StageCreate)
    this.interactHandlerMap.set('move', StageMove)
    this.interactHandlerMap.set('select', StageSelect)
    this.currentType.hook(this.autoInteract)
    Surface.inited$.hook(() => {
      this.currentType.dispatch('select')
    })
  }
  dispose() {
    this.interactHandlerMap.get(this.previousType!)?.endInteract()
  }
  private autoInteract() {
    this.interactHandlerMap.get(this.previousType!)?.endInteract()
    this.interactHandlerMap.get(this.currentType.value)?.startInteract()
    this.previousType = this.currentType.value
  }
}

export const StageInteract = new StageInteractService()
