import { makeObservable, observable, when } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { auto, autobind } from '~/helper/decorator'
import { EE } from '~/helper/event-emitter'
import { DragService, injectDrag } from '../drag'
import { PixiService, injectPixi } from './pixi'

export type IStageInteractType = 'select' | 'move' | 'create'

@autobind
@injectable()
export class StageService {
  @observable interactType: IStageInteractType = 'select'
  private previousInteractType?: IStageInteractType
  constructor(
    @injectPixi private pixiService: PixiService,
    @injectDrag private dragService: DragService
  ) {
    makeObservable(this)
    when(() => pixiService.initialized).then(() => {
      this.autoCursor()
      this.autoInteract()
    })
  }
  setInteractType(interactType: IStageInteractType = 'select') {
    this.interactType = interactType
  }
  @auto private autoInteract() {
    EE.emit('stage-interact-type-changed', {
      currentType: this.interactType,
      previousType: this.previousInteractType,
    })
    this.previousInteractType = this.interactType
  }
  @auto private autoCursor() {
    const cursor = interactCursorMap[this.interactType]
    this.dragService.setCursor(cursor)
    this.pixiService.container.style.cursor = cursor
  }
}

export const injectStage = inject(StageService)

const interactCursorMap = {
  select: 'auto',
  move: 'grab',
  create: 'crosshair',
}

export function listenInteractTypeChange<
  T extends { startInteract: () => void; endInteract: () => void }
>(target: T, type: IStageInteractType) {
  EE.on('stage-interact-type-changed', ({ currentType, previousType }) => {
    if (<IStageInteractType>currentType === type) target.startInteract()
    if (<IStageInteractType>previousType === type) target.endInteract()
  })
}
