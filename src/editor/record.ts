import { autobind } from '~/shared/decorator'
import { createSignal } from '~/shared/signal'
import { INoopFunc } from '~/shared/utils/normal'

type IUndoRedoRecord = {
  undo: INoopFunc
  redo: INoopFunc
}

@autobind
export class RecordService {
  private stack = <IUndoRedoRecord[]>[]
  index = createSignal(-1)
  get canUndo() {
    return this.index.value >= 0
  }
  get canRedo() {
    return this.index.value < this.stack.length - 1
  }
  push(undoRedo: IUndoRedoRecord) {
    this.stack.push(undoRedo)
    this.index.dispatch(this.stack.length - 1)
  }
  undo() {
    if (!this.canUndo) return
    this.stack[this.index.value].undo()
    this.index.dispatch(this.index.value - 1)
  }
  redo() {
    if (!this.canRedo) return
    this.index.dispatch(this.index.value + 1)
    this.stack[this.index.value].redo()
  }
}

export const Record = new RecordService()
