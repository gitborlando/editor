import autobind from 'class-autobind-decorator'
import { YSync } from 'src/editor/y-state/y-sync'
import { proxy, Snapshot, snapshot, subscribe } from 'valtio'
import { bind } from 'valtio-yjs'
import { IndexeddbPersistence } from 'y-indexeddb'
import * as Y from 'yjs'

@autobind
class YStateService {
  doc!: Y.Doc
  snap!: Snapshot<V1.Schema>
  state!: V1.Schema

  inited$ = Signal.create(false)
  flushPatch$ = Signal.create<Patch>()

  private yIndexDB!: IndexeddbPersistence
  private unSub?: () => void

  async initSchema(fileId: string, mockSchema?: V1.Schema) {
    this.doc = new Y.Doc()
    // this.yIndexDB = new IndexeddbPersistence(fileId, this.doc)
    // await this.yIndexDB.whenSynced
    YSync.init(fileId, this.doc)

    this.state = proxy(mockSchema)
    this.snap = snapshot(this.state)
    bind(this.state, this.doc.getMap('schema'))

    this.unSub?.()
    this.unSub = this.subscribeState()

    YClients.clientId = this.doc.clientID
    YUndo.initStateUndo(this.doc.getMap('schema'))

    this.inited$.dispatch(true)
  }

  findSnap<T extends V1.SchemaItem>(id: string): T {
    return this.snap[id] as T
  }

  find<T extends V1.SchemaItem>(id: string): T {
    return this.state[id] as T
  }

  private subscribeState() {
    return subscribe(this.state, (unstable_ops: any[]) => {
      if (!this.inited$.value) return
      this.snap = snapshot(this.state)
      this.makePatches(unstable_ops)
    })
  }

  private makePatches(unstable_ops: any[]) {
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
  }
}

export const YState = new YStateService()
