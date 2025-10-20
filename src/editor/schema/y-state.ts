import { Signal } from '@gitborlando/signal'
import autobind from 'class-autobind-decorator'
import { YClients } from 'src/editor/schema/y-clients'
import { YUndo } from 'src/editor/schema/y-undo'
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

  constructor() {
    this.bind()
  }

  async initSchema(fileId: string, mockSchema?: V1.Schema) {
    // this.yIndexDB = new IndexeddbPersistence(fileId, this.doc)
    // await this.yIndexDB.whenSynced
    // YWS.init(fileId, this.doc)
    if (mockSchema) Object.assign(this.state, mockSchema)
    this.snap = snapshot(this.state)

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

  private bind() {
    this.doc = new Y.Doc()
    this.state = proxy({} as V1.Schema)
    bind(this.state, this.doc.getMap('schema'))
    this.unSub?.()
    this.unSub = this.subscribeState()
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
