import autobind from 'class-autobind-decorator'
import { nanoid } from 'nanoid'
import { createSignal } from '~/shared/signal/signal'
import Immui, { IApplyPatchOption, IImmuiPatch } from '../../shared/immui/immui'
import { socket } from './cooperation'
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

type IKeyPath = (ISchemaPropKey | (string & {}) | number)[]

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
  operationList = <ISchemaOperation[]>[]
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
  itemAdd(item: ISchemaItem, keypath: IKeyPath, value: any) {
    this.immui.add(this.schema, [item.id, ...keypath], value)
  }
  itemReset(item: ISchemaItem, keypath: IKeyPath, value: any) {
    this.immui.reset(this.schema, [item.id, ...keypath], value)
  }
  itemDelete(item: ISchemaItem, keypath: IKeyPath) {
    this.immui.delete(this.schema, [item.id, ...keypath])
  }
  applyPatches(patches: IImmuiPatch[], option?: IApplyPatchOption) {
    this.immui.applyPatches(this.schema, patches, option)
  }
  nextSchema() {
    this.schema = this.immui.next(this.schema)
    this.schemaChanged.dispatch()
  }
  commitOperation(description: string, option?: ICommitOperationOption) {
    const id = nanoid()
    const patches = this.immui.commitPatches()
    const timestamp = performance.now()
    const operation = { id, patches, description, timestamp, ...option }
    this.operationList.push(operation)
    socket.send(operation)
  }
  finalOperation(description: string, option?: ICommitOperationOption) {
    this.commitOperation(description, option)
    this.commitHistory(description)
  }
  commitHistory(description: string) {
    SchemaHistory.commit(description)
    this.nextSchema()
  }
}

export const Schema = new SchemaService()
