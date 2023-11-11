import autoBind from 'auto-bind'
import { autorun, makeObservable } from 'mobx'
import { EditorService } from '~/service/editor/editor'
import { StageService } from '../stage'
import { StageStatusCreate } from './create'
import { StageStatusDragStage } from './drag-stage'
import { StageStatusSelect } from './select'

export type IStageStatusType = 'select' | 'dragStage' | 'create'

type IOperate = {
  start: () => void
  end: () => void
}

export class StageStatus {
  status: IStageStatusType = 'select'
  lastStatus: IStageStatusType = 'select'
  select: StageStatusSelect
  dragStage: StageStatusDragStage
  create: StageStatusCreate
  private operateMap = new Map<IStageStatusType, IOperate>()
  constructor(private stage: StageService, private editor: EditorService) {
    autoBind(this)
    makeObservable(this, { status: true })
    this.select = new StageStatusSelect(this, this.stage, this.editor)
    this.dragStage = new StageStatusDragStage(this, this.stage, this.editor)
    this.create = new StageStatusCreate(this, this.stage, this.editor)
  }
  init() {
    const statusList = ['select', 'dragStage', 'create'] as IStageStatusType[]
    statusList.forEach((status) =>
      this.operateMap.set(status, {
        start: () => this[status].start(),
        end: () => this[status].end(),
      })
    )
    autorun(() => {
      this.operateMap.get(this.lastStatus)?.end()
      this.operateMap.get(this.status)?.start()
      this.lastStatus = this.status
    })
  }
  setStatus(status: IStageStatusType) {
    this.status = status
    return this
  }
}
