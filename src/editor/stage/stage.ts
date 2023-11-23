import { makeObservable, observable } from 'mobx'
import { delay, inject, injectable } from 'tsyringe'
import { auto, autobind } from '~/helper/decorator'
import { EE } from '~/helper/event-emitter'
import { DragService, injectDrag } from '../drag'
import { PixiService, injectPixi } from './pixi'

export type IStageInteractType = 'select' | 'dragStage' | 'create'

@autobind
@injectable()
export class StageService {
  @observable cursor = 'auto'
  @observable interactType: IStageInteractType = 'select'
  private previousInteractType?: IStageInteractType
  constructor(
    @injectPixi private pixiService: PixiService,
    @injectDrag private dragService: DragService
  ) {
    makeObservable(this)
    EE.on('pixi-stage-initialized', () => {
      this.autoCursor()
      this.autoInteract()
    })
  }
  setCursor(cursor = 'auto') {
    this.cursor = cursor
    this.dragService.setCursor(cursor)
    this.pixiService.container.style.cursor = cursor
  }
  setInteractType(interactType: IStageInteractType = 'select') {
    this.interactType = interactType
  }
  @auto private autoCursor() {
    this.interactType === 'select' && this.setCursor('auto')
    this.interactType === 'dragStage' && this.setCursor('grab')
    this.interactType === 'create' && this.setCursor('crosshair')
  }
  @auto private autoInteract() {
    EE.emit('stage-interact-type-changed', {
      currentType: this.interactType,
      previousType: this.previousInteractType,
    })
    this.previousInteractType = this.interactType
  }
}

export const injectStage = inject(StageService)
export const delayInjectStage = inject(delay(() => StageService))

export function listenInteractTypeChange<
  T extends { startInteract: () => void; endInteract: () => void }
>(target: T, type: IStageInteractType) {
  EE.on('stage-interact-type-changed', ({ currentType, previousType }) => {
    if (<IStageInteractType>currentType === type) target.startInteract()
    if (<IStageInteractType>previousType === type) target.endInteract()
  })
}
