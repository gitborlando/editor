import autobind from 'class-autobind-decorator'
import { Drag } from '~/global/event/drag'
import { createSignal } from '~/shared/signal'
import { Pixi } from '../pixi'
import { StageCreate } from './create'
import { StageMove } from './move'
import { StageSelect } from './select'

export type IStageInteractType = 'select' | 'move' | 'create'

@autobind
export class StageInteractService {
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
    this.currentType.hook(this.autoCursor)
    Pixi.inited.hook(() => this.currentType.dispatch('select'))
  }
  private autoInteract() {
    this.interactHandlerMap.get(this.currentType.value)?.startInteract()
    this.interactHandlerMap.get(this.previousType!)?.endInteract()
    this.previousType = this.currentType.value
  }
  private autoCursor() {
    const cursor = interactCursorMap[this.currentType.value]
    Drag.setCursor(cursor)
    Pixi.htmlContainer.style.cursor = cursor
  }
}

export const StageInteract = new StageInteractService()

const interactCursorMap = {
  select: 'auto',
  move: 'grab',
  create: 'crosshair',
}
