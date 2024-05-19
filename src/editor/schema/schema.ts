import autobind from 'class-autobind-decorator'
import { createSignal } from '~/shared/signal/signal'
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
  onReviewSchema = createSignal<ImmuiPatch>()
  operationList = <ISchemaOperation[]>[]
  changePatches = <ImmuiPatch[]>[]
  private immui = new Immui()
  initSchema(schema: ISchema) {
    this.schema = schema
    this.meta = this.find<IMeta>('meta')
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
    const patches = this.immui.commitPatches()
    const operation = { id: '', patches, description, timestamp: 0, ...option }
    this.changePatches.push(...patches)
    this.operationList.push(operation)
  }
  finalOperation(description: string, option?: ICommitOperationOption) {
    this.commitOperation(description, option)
    this.commitHistory(description)
  }
  nextSchema() {
    this.schema = this.immui.next(this.schema)
    this.changePatches.forEach(this.onReviewSchema.dispatch)
    this.schemaChanged.dispatch()
    this.changePatches = []
  }
  commitHistory(description: string) {
    this.nextSchema()
    SchemaHistory.commit(description)
  }
}

export const Schema = new SchemaService()
