import autobind from 'class-autobind-decorator'
import { createSignal } from '~/shared/signal'
import { Schema } from './schema'
import { ISchemaHistory, ISchemaOperation } from './type'

@autobind
export class SchemaHistoryService {
  stack = <ISchemaHistory[]>[]
  index = createSignal(-1)
  private lastOperationsLength = 0
  private isInAction = false
  get canUndo() {
    return this.index.value >= 0
  }
  get canRedo() {
    return this.index.value < this.stack.length - 1
  }
  initHook() {
    Schema.afterSetSchema.hook({ afterAll: true }, () => {
      this.startRecord()
    })
  }
  commit(description: string) {
    if (this.isInAction) return
    if (this.index.value !== this.stack.length - 1) {
      this.stack.splice(this.index.value + 1)
    }
    const operations = Schema.operationList.slice(this.lastOperationsLength)
    this.stack.push({ operations, description })
    this.index.dispatch(this.stack.length - 1)
    this.lastOperationsLength = Schema.operationList.length
  }
  undo() {
    if (!this.canUndo) return
    const { operations } = this.stack[this.index.value]
    this.replayOperations('undo', operations.slice().reverse())
    this.index.dispatch(this.index.value - 1)
  }
  redo() {
    if (!this.canRedo) return
    const { operations } = this.stack[this.index.value + 1]
    this.replayOperations('redo', operations)
    this.index.dispatch(this.index.value + 1)
  }
  startAction() {
    this.isInAction = true
  }
  endAction() {
    this.isInAction = false
  }
  private startRecord() {
    this.lastOperationsLength = Schema.operationList.length
  }
  private replayOperations(type: 'undo' | 'redo', operations: ISchemaOperation[]) {
    operations.forEach((operation, i) => {
      const { diff, inverseType } = operation
      Schema.applyPatch(type === 'undo' ? diff.inversePatches : diff.patches)
      if (type === 'undo' && inverseType)
        Schema.broadcast({ ...operation, changeType: inverseType })
      else Schema.broadcast(operation)
    })
  }
}

export const SchemaHistory = new SchemaHistoryService()
