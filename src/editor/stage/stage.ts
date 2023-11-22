import { makeObservable, observable } from 'mobx'
import { auto, autoBind } from '~/helper/decorator'
import { EE } from '~/helper/event-emitter'
import { PixiService } from './pixi'

export type IStageInteractType = 'select' | 'dragStage' | 'create'

@autoBind
export class StageService {
  @observable cursor = 'auto'
  @observable interactType: IStageInteractType = 'select'
  private previousInteractType?: IStageInteractType
  constructor(private pixiService: PixiService) {
    makeObservable(this)
    EE.on('pixi-stage-initialized', () => {
      this.autoCursor()
      this.autoInteract()
    })
  }
  setCursor(cursor = 'auto') {
    this.cursor = cursor
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
      type: this.interactType,
      previousType: this.previousInteractType,
    })
    this.previousInteractType = this.interactType
  }
}

export function listenInteractTypeChange<
  T extends { startInteract: () => void; endInteract: () => void }
>(target: T, type: IStageInteractType) {
  EE.on('stage-interact-type-changed', ({ type: currentType, previousType }) => {
    if (<IStageInteractType>currentType === type) target.startInteract()
    if (<IStageInteractType>previousType === type) target.endInteract()
  })
}
