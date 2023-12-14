import { makeObservable, observable, when } from 'mobx'
import { delay, inject, injectable } from 'tsyringe'
import { DragService, injectDrag } from '~/global/drag'
import { Watch, autobind } from '~/shared/decorator'
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
    @injectPixi private Pixi: PixiService,
    @injectDrag private Drag: DragService,
    @injectStageMove private StageMove: StageMoveService,
    @injectStageSelect private StageSelect: StageSelectService,
    @inject(delay(() => StageCreateService)) private StageCreate: StageCreateService
  ) {
    makeObservable(this)
    this.interactHandlerMap.set('create', this.StageCreate)
    this.interactHandlerMap.set('move', this.StageMove)
    this.interactHandlerMap.set('select', this.StageSelect)
    when(() => this.Pixi.initialized).then(() => {
      this.autoInteract()
      this.autoCursor()
    })
  }
  setType(type: IStageInteractType = 'select') {
    if (this.type === type) return
    this.type = type
  }
  @Watch('type')
  private autoInteract() {
    this.interactHandlerMap.get(this.type)?.startInteract()
    this.interactHandlerMap.get(this.previousType!)?.endInteract()
    this.previousType = this.type
  }
  @Watch('type')
  private autoCursor() {
    const cursor = interactCursorMap[this.type]
    this.Drag.setCursor(cursor)
    this.Pixi.container.style.cursor = cursor
  }
}

export const injectStageInteract = inject(StageInteractService)

const interactCursorMap = {
  select: 'auto',
  move: 'grab',
  create: 'crosshair',
}
