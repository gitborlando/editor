import { Signal } from '@gitborlando/signal'
import autobind from 'class-autobind-decorator'
import { YWS } from 'src/editor/schema/y-ws'
import { proxy, Snapshot, snapshot, subscribe } from 'valtio'
import { bind } from 'valtio-yjs'
import { IndexeddbPersistence } from 'y-indexeddb'
import * as Y from 'yjs'

@autobind
class YStateService {
  stateDoc!: Y.Doc
  state!: Snapshot<V1.Schema>

  stateChange$ = Signal.create<V1.Schema>()
  flushPatch$ = Signal.create<Patch>()

  undoManager!: Y.UndoManager

  proxy!: any

  private yIndexDB!: IndexeddbPersistence
  private unSub?: () => void

  async initSchema(fileId: string, mockSchema?: V1.Schema) {
    this.stateDoc = new Y.Doc()
    // this.yIndexDB = new IndexeddbPersistence(fileId, this.doc)
    // await this.yIndexDB.whenSynced
    YWS.init(fileId, this.stateDoc)

    this.proxy = proxy({} as V1.Schema)
    bind(this.proxy, this.stateDoc.getMap('schema'))

    if (mockSchema) Object.assign(this.proxy, mockSchema)

    this.undoManager = new Y.UndoManager(this.stateDoc)

    this.unSub?.()
    this.unSub = this.subscribeState()
  }

  findState<T extends V1.SchemaItem>(id: string): T {
    return this.state[id] as T
  }

  find<T extends V1.SchemaItem>(id: string): T {
    return this.proxy[id] as T
  }

  private subscribeState() {
    return subscribe(this.proxy, (unstable_ops: any[]) => {
      this.state = snapshot(this.proxy)
      this.stateChange$.dispatch(this.state as V1.Schema)

      const patches: Patch[] = []
      unstable_ops.forEach(([type, path, value, oldValue]) => {
        const pathStr = path.join('/')
        const pathAndKeys = { path: pathStr, keys: path }
        if (type === 'set') {
          oldValue === undefined
            ? patches.push({ type: 'add', ...pathAndKeys, value })
            : patches.push({ type: 'replace', ...pathAndKeys, value, oldValue })
        } else if (type === 'delete') {
          patches.push({ type: 'remove', ...pathAndKeys, oldValue })
        }
      })
      patches.forEach(this.flushPatch$.dispatch)
    })
  }
}

export const YState = new YStateService()
