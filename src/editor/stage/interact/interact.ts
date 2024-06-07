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
  canHover = createSignal(true)
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
    // this.currentType.hook(this.autoCursor)
    Surface.inited.hook(() => {
      //  this.bindHover()
      this.currentType.dispatch('select')
    })
  }
  private autoInteract() {
    this.interactHandlerMap.get(this.previousType!)?.endInteract()
    this.interactHandlerMap.get(this.currentType.value)?.startInteract()
    this.previousType = this.currentType.value
  }
}

export const StageInteract = new StageInteractService()

const interactCursorMap = {
  select: 'auto',
  move: 'grab',
  create: 'crosshair',
}
