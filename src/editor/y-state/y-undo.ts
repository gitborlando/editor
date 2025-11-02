import { clone } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'
import { computed, makeObservable, observable } from 'mobx'
import { NeedUndoClientState, YClients } from 'src/editor/y-state/y-clients'
import * as Y from 'yjs'

type YUndoInfo = {
  type: 'state' | 'client' | 'all'
  description: string
  clientState?: NeedUndoClientState
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

  initClientUndo() {
    this.initClientState = this.getClientState()
  }

  private initClientState!: NeedUndoClientState

  private getClientState() {
    return clone({
      selectIds: YClients.client.selectIdMap,
      selectPageId: YClients.client.selectPageId,
    })
  }

  private applyClientState() {
    const clientState =
      this.stack[this.next - 1]?.clientState || this.initClientState
    Object.assign(YClients.client, clientState)
  }

  undo() {
    this.next = Math.max(this.next - 1, 0)
    const { type } = this.stack[this.next]
    if (type === 'state') this.stateUndo.undo()
    if (type === 'client') this.applyClientState()
    if (type === 'all') {
      this.stateUndo.undo()
      this.applyClientState()
    }
  }

  redo() {
    this.next = Math.min(this.next + 1, this.stack.length)
    const { type } = this.stack[this.next - 1]
    if (type === 'state') this.stateUndo.redo()
    if (type === 'client') this.applyClientState()
    if (type === 'all') {
      this.stateUndo.redo()
      this.applyClientState()
    }
  }

  private shouldTrack = true

  track(info: YUndoInfo) {
    if (!this.shouldTrack) return

    const { type } = info

    if (type === 'state' || type === 'all') {
      this.stateUndo.stopCapturing()
    }
    if (type === 'client' || type === 'all') {
      info.clientState = this.getClientState()
    }

    this.stack.splice(this.next, this.stack.length - this.next, info)
    this.next = this.stack.length
  }

  untrackScope(callback: () => void) {
    this.shouldTrack = false
    callback()
    this.shouldTrack = true
  }
}

export const YUndo = new YUndoService()
