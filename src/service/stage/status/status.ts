import autoBind from 'auto-bind'
import { autorun, makeAutoObservable } from 'mobx'
import { StageService } from '../stage'
import { StageStatusCreate } from './create'
import { StageStatusDragStage } from './drag-stage'
import { StageStatusSelect } from './select'

export type IStageStatusType = 'select' | 'dragStage' | 'create' | 'edit'
type ICreateType = 'frame' | 'rect' | 'ellipse' | 'line' | 'text' | 'img'

type IOperate = StageStatusSelect | StageStatusDragStage | StageStatusCreate

export class StageStatus {
  status: IStageStatusType = 'select'
  lastStatus: IStageStatusType = 'select'
  createType: ICreateType = 'rect'
  private operateMap = new Map<IStageStatusType, IOperate>()
  constructor(private stage: StageService) {
    autoBind(this)
    makeAutoObservable(this, { lastStatus: false })
    this.operateMap.set('select', new StageStatusSelect(this, this.stage, this.stage.editor))
    this.operateMap.set('dragStage', new StageStatusDragStage(this.stage, this.stage.editor))
    this.operateMap.set('create', new StageStatusCreate(this, this.stage, this.stage.editor))
  }
  init() {
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
  setCreateType(type: ICreateType) {
    this.createType = type
    return this
  }
}
