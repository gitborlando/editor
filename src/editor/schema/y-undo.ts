import autobind from 'class-autobind-decorator'
import { computed, makeObservable, observable } from 'mobx'
import * as Y from 'yjs'

type YUndoInfo = {
  type: 'client' | 'state' | 'all'
  description: string
}

@autobind
class YUndoService {
  stateUndo!: Y.UndoManager
  clientUndo!: Y.UndoManager

  stack: YUndoInfo[] = []
  next = 0

  get canUndo() {
    return this.next > 0
  }
  get canRedo() {
    return this.next < this.stack.length
  }

  constructor() {
    makeObservable(this, {
      next: observable,
      canUndo: computed,
      canRedo: computed,
    })
  }

  initStateUndo(stateMap: Y.Map<V1.Schema>) {
    this.stateUndo = new Y.UndoManager(stateMap)
  }

  initClientUndo(clientMap: Y.Map<V1.Clients>) {
    this.clientUndo = new Y.UndoManager(clientMap)
  }

  undo() {
    this.next = Math.max(this.next - 1, 0)
    const { type } = this.stack[this.next]
    if (type === 'state') this.stateUndo.undo()
    if (type === 'client') this.clientUndo.undo()
    if (type === 'all') {
      this.stateUndo.undo()
      this.clientUndo.undo()
    }
  }

  redo() {
    this.next = Math.min(this.next + 1, this.stack.length)
    const { type } = this.stack[this.next - 1]
    if (type === 'state') this.stateUndo.redo()
    if (type === 'client') this.clientUndo.redo()
    if (type === 'all') {
      this.stateUndo.redo()
      this.clientUndo.redo()
    }
  }

  private shouldTrack = true

  track(info: YUndoInfo) {
    if (!this.shouldTrack) return

    this.next++
    this.stack.push(info)
    const { type } = info
    if (type === 'state') this.stateUndo.stopCapturing()
    if (type === 'client') this.clientUndo.stopCapturing()
    if (type === 'all') {
      this.stateUndo.stopCapturing()
      this.clientUndo.stopCapturing()
    }
  }

  untrackScope(callback: () => void) {
    this.shouldTrack = false
    callback()
    this.shouldTrack = true
  }
}

export const YUndo = new YUndoService()
