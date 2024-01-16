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
  type = createSignal(<IStageInteractType>'select')
  private previousType?: IStageInteractType
  private interactHandlerMap = new Map<
    IStageInteractType,
    { startInteract: () => void; endInteract: () => void }
  >()
  initHook() {
    this.interactHandlerMap.set('create', StageCreate)
    this.interactHandlerMap.set('move', StageMove)
    this.interactHandlerMap.set('select', StageSelect)
    this.type.hook(this.autoInteract)
    this.type.hook(this.autoCursor)
    Pixi.inited.hook(() => this.type.dispatch('select'))
  }
  private autoInteract() {
    this.interactHandlerMap.get(this.type.value)?.startInteract()
    this.interactHandlerMap.get(this.previousType!)?.endInteract()
    this.previousType = this.type.value
  }
  private autoCursor() {
    const cursor = interactCursorMap[this.type.value]
    Drag.setCursor(cursor)
    Pixi.container.style.cursor = cursor
  }
}

export const StageInteract = new StageInteractService()

const interactCursorMap = {
  select: 'auto',
  move: 'grab',
  create: 'crosshair',
}
