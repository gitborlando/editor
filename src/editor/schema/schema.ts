import autobind from 'class-autobind-decorator'
import { createSignal } from 'src/shared/signal/signal'
import { flushFuncs } from 'src/shared/utils/array'
import { INoopFunc } from 'src/shared/utils/normal'
import Immui, { ImmuiApplyPatchOption, ImmuiPatch } from '../../shared/immui/immui'
import { SchemaHistory } from './history'
import {
  IClient,
  ID,
  IMeta,
  INodeOrPage,
  ISchema,
  ISchemaItem,
  ISchemaOperation,
  ISchemaPropKey,
} from './type'

type ICommitOperationOption = Partial<ISchemaOperation> & {
  noHistory?: boolean
}

@autobind
class SchemaService {
  schema!: ISchema
  meta!: IMeta
  client!: IClient
  inited = createSignal()
  schemaChanged = createSignal()
  onFlushPatches = createSignal<ImmuiPatch>()
  operationList = <ISchemaOperation[]>[]
  changePatches = <ImmuiPatch[]>[]
  private immui = new Immui()
  private matchPatchFuncs = new Set<INoopFunc>()
  initSchema(schema: ISchema) {
    this.schema = schema
    this.meta = this.find<IMeta>('meta')
    this.client = this.find<IClient>('client')
    this.inited.dispatch()
  }
  find<T extends ISchemaItem>(id: ID): T {
    return this.schema[id] as T
  }
  addItem(item: INodeOrPage) {
    this.immui.add(this.schema, [item.id], item)
  }
  removeItem(item: INodeOrPage) {
    this.immui.delete(this.schema, [item.id])
  }
  itemAdd(item: ISchemaItem, keypath: ISchemaPropKey[], value: any) {
    this.immui.add(this.schema, [item.id, ...keypath], value)
  }
  itemReset(item: ISchemaItem, keypath: ISchemaPropKey[], value: any) {
    this.immui.reset(this.schema, [item.id, ...keypath], value)
  }
  itemDelete(item: ISchemaItem, keypath: ISchemaPropKey[]) {
    this.immui.delete(this.schema, [item.id, ...keypath])
  }
  applyPatches(patches: ImmuiPatch[], option?: ImmuiApplyPatchOption) {
    this.immui.applyPatches(this.schema, patches, option)
  }
  commitOperation(description: string, option?: ICommitOperationOption) {
    return
    // const patches = this.immui.commitPatches()
    // const operation = { id: '', patches, description, timestamp: 0, ...option }
    // this.changePatches.push(...patches)
    // this.operationList.push(operation)
  }
  finalOperation(description: string, option?: ICommitOperationOption) {
    this.commitOperation(description, option)
    this.commitHistory(description)
  }
  nextSchema() {
    const [schema, patches] = this.immui.next(this.schema)
    this.schema = schema
    this.meta = this.find<IMeta>('meta')
    this.client = this.find<IClient>('client')
    patches.forEach(this.onFlushPatches.dispatch)
    flushFuncs(this.matchPatchFuncs)
    this.schemaChanged.dispatch()
  }
  commitHistory(description: string) {
    this.nextSchema()
    SchemaHistory.commit(description)
  }
  onMatchPatch(patten: string, callback: INoopFunc) {
    const pattenArr = patten.split('/').filter(Boolean)
    return this.onFlushPatches.hook((patch) => {
      if (!Immui.matchPath(patch.keys, pattenArr)) return
      this.matchPatchFuncs.add(callback)
    })
  }
}

export const Schema = new SchemaService()
