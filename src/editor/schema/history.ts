import autobind from 'class-autobind-decorator'
import { createSignal } from '~/shared/signal/signal'
import { Schema } from './schema'
import { ISchemaHistory, ISchemaOperation } from './type'

@autobind
class SchemaHistoryService {
  stack = <ISchemaHistory[]>[]
  index = createSignal(-1)
  afterReplay = createSignal<'undo' | 'redo'>()
  private lastOperationsLength = 0
  private isStart = false
  private isInAction = false
  get canUndo() {
    return this.index.value >= 0
  }
  get canRedo() {
    return this.index.value < this.stack.length - 1
  }
  initHook() {
    Schema.inited.hook({ afterAll: true }, this.startRecord)
  }
  commit(description: string) {
    if (this.isInAction) return
    if (!this.isStart) {
      return (this.lastOperationsLength = Schema.operationList.length)
    }
    if (this.index.value !== this.stack.length - 1) {
      this.stack.splice(this.index.value + 1)
    }
    let operations = Schema.operationList.slice(this.lastOperationsLength)
    operations = operations.filter((i) => !i.noHistory)
    this.stack.push({ operations, description })
    this.index.dispatch(this.stack.length - 1)
    this.lastOperationsLength = Schema.operationList.length
  }
  undo() {
    if (!this.canUndo) return
    const { operations } = this.stack[this.index.value]
    this.replayOperations('undo', operations.slice().reverse())
    this.index.dispatch(this.index.value - 1)
    this.afterReplay.dispatch('undo')
  }
  redo() {
    if (!this.canRedo) return
    const { operations } = this.stack[this.index.value + 1]
    this.replayOperations('redo', operations)
    this.index.dispatch(this.index.value + 1)
    this.afterReplay.dispatch('redo')
  }
  startAction() {
    this.isInAction = true
  }
  endActionWithCommit(description: string) {
    this.isInAction = false
    this.commit(description)
  }
  private startRecord() {
    this.isStart = true
    this.lastOperationsLength = Schema.operationList.length
  }
  private replayOperations(type: 'undo' | 'redo', operations: ISchemaOperation[]) {
    operations.forEach(({ patches }) => {
      Schema.applyPatches(patches, { reverse: type === 'undo' })
    })
    Schema.commitOperation('replay')
    Schema.nextSchema()
  }
}

export const SchemaHistory = new SchemaHistoryService()
