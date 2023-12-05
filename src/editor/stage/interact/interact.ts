import { makeObservable, observable, when } from 'mobx'
import { delay, inject, injectable } from 'tsyringe'
import { autobind, watch } from '~/editor/utility/decorator'
import { DragService, injectDrag } from '../../drag'
import { PixiService, injectPixi } from '../pixi'
import { StageCreateService } from './create'
import { StageMoveService, injectStageMove } from './move'
import { StageSelectService, injectStageSelect } from './select'

export type IStageInteractType = 'select' | 'move' | 'create'

@autobind
@injectable()
export class StageInteractService {
  @observable type: IStageInteractType = 'select'
  private previousType?: IStageInteractType
  private interactHandlerMap = new Map<
    IStageInteractType,
    { startInteract: () => void; endInteract: () => void }
  >()
  constructor(
    @injectPixi private pixiService: PixiService,
    @injectDrag private dragService: DragService,
    @injectStageMove private stageMoveService: StageMoveService,
    @injectStageSelect private stageSelectService: StageSelectService,
    @inject(delay(() => StageCreateService)) private stageCreateService: StageCreateService
  ) {
    makeObservable(this)
    this.interactHandlerMap.set('create', this.stageCreateService)
    this.interactHandlerMap.set('move', this.stageMoveService)
    this.interactHandlerMap.set('select', this.stageSelectService)
    when(() => this.pixiService.initialized).then(() => {
      this.autoInteract()
      this.autoCursor()
    })
  }
  setType(type: IStageInteractType = 'select') {
    if (this.type === type) return
    this.type = type
  }
  @watch('type') private autoInteract() {
    this.interactHandlerMap.get(this.type)?.startInteract()
    this.interactHandlerMap.get(this.previousType!)?.endInteract()
    this.previousType = this.type
  }
  @watch('type') private autoCursor() {
    const cursor = interactCursorMap[this.type]
    this.dragService.setCursor(cursor)
    this.pixiService.container.style.cursor = cursor
  }
}

export const injectStageInteract = inject(StageInteractService)

const interactCursorMap = {
  select: 'auto',
  move: 'grab',
  create: 'crosshair',
}
