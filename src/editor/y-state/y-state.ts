import autobind from 'class-autobind-decorator'
import Immut, { ImmutPatch } from 'src/utils/immut/immut'
import { bind } from 'src/utils/immut/immut-y'
import { IndexeddbPersistence } from 'y-indexeddb'
import * as Y from 'yjs'

@autobind
class YStateService {
  doc!: Y.Doc
  immut = new Immut(<V1.Schema>{})

  inited$ = Signal.create(false)
  flushPatch$ = Signal.create<ImmutPatch>()

  private yIndexDB!: IndexeddbPersistence
  private unSub?: () => void

  get state() {
    return this.immut.state
  }
  get push() {
    return this.immut.push
  }
  get set() {
    return this.immut.set
  }
  get delete() {
    return this.immut.delete
  }
  get next() {
    return this.immut.next
  }

  async initSchema(fileId: string, mockSchema?: V1.Schema) {
    this.doc = new Y.Doc()
    // this.yIndexDB = new IndexeddbPersistence(fileId, this.doc)
    // await this.yIndexDB.whenSynced

    this.immut.state = mockSchema!
    bind(this.immut, this.doc.getMap('schema'))

    this.unSub?.()
    this.unSub = this.subscribeSchema()

    YClients.clientId = this.doc.clientID
    YUndo.initStateUndo(this.doc.getMap('schema'))

    this.inited$.dispatch(true)
  }

  find<T extends V1.SchemaItem>(id: string): T {
    return this.state[id] as T
  }

  private subscribeSchema() {
    return this.immut.subscribe((patches: ImmutPatch[]) => {
      if (!this.inited$.value) return
      patches.forEach((patch) => this.flushPatch$.dispatch(patch))
    })
  }
}

export const YState = new YStateService()
