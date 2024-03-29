import autobind from 'class-autobind-decorator'
import { createSignal, createSignalContext } from '~/shared/signal'
import { INoopFunc } from '~/shared/utils/normal'

export type IUndoRedoRecord = {
  description: string
  detail: string | Record<string, any>
  undo: INoopFunc
  redo: INoopFunc
}

export type IActionRecord = {
  description: string
  subStack: IUndoRedoRecord[]
  undo: INoopFunc
  redo: INoopFunc
}

export const recordSignalContext = createSignalContext<boolean>('record')

@autobind
export class RecordService {
  stack = <(IUndoRedoRecord | IActionRecord)[]>[]
  index = createSignal(-1)
  private isInAction = false
  private subStack = <IUndoRedoRecord[]>[]
  get canUndo() {
    return this.index.value >= 0
  }
  get canRedo() {
    return this.index.value < this.stack.length - 1
  }
  push(record: IUndoRedoRecord | IActionRecord) {
    if (this.index.value !== this.stack.length - 1) {
      this.stack.splice(this.index.value + 1)
    }
    if (this.isInAction) {
      return this.subStack.push(record as IUndoRedoRecord)
    }
    this.stack.push(record)
    this.index.dispatch(this.stack.length - 1)
  }
  startAction() {
    this.isInAction = true
  }
  endAction(description: string) {
    this.isInAction = false
    const actionRecord = {
      description,
      subStack: [...this.subStack],
      undo: () => [...actionRecord.subStack].reverse().forEach((i) => i.undo()),
      redo: () => actionRecord.subStack.forEach((i) => i.redo()),
    }
    this.push(actionRecord)
    this.subStack = []
  }
  undo() {
    if (!this.canUndo) return
    recordSignalContext(true)
    this.stack[this.index.value].undo()
    this.index.dispatch(this.index.value - 1)
    recordSignalContext(false)
  }
  redo() {
    if (!this.canRedo) return
    recordSignalContext(true)
    this.stack[this.index.value + 1].redo()
    this.index.dispatch(this.index.value + 1)
    recordSignalContext(false)
  }
}

export const Record = new RecordService()
