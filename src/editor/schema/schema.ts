import autobind from 'class-autobind-decorator' //@ts-ignore
import { diffApply, jsonPatchPathConverter } from 'just-diff-apply'
import { nanoid } from 'nanoid'
import { createCache } from '~/shared/cache'
import { createSignal } from '~/shared/signal/signal'
import { Immui } from '../../shared/immui/immui'
import { IPatch, SchemaDiff } from './diff'
import { SchemaHistory } from './history'
import {
  IClient,
  ID,
  IMeta,
  INodeOrPage,
  IPage,
  ISchema,
  ISchemaChangeType,
  ISchemaItem,
  ISchemaListener,
  ISchemaOperation,
  ISchemaPropKey,
} from './type'

@autobind
export class SchemaService {
  schema!: ISchema
  meta!: IMeta
  client!: IClient
  pages = <IPage[]>[]
  afterSetSchema = createSignal()
  operationList = <ISchemaOperation[]>[]
  listenerMap = createCache<ISchemaChangeType, ISchemaListener['callback']>()
  initSchema(schema: ISchema) {
    this.schema = schema
    this.meta = this.find<IMeta>('meta')
    this.pages = this.meta.pageIds.map(this.find<IPage>)
    this.afterSetSchema.dispatch()
  }
  addItem(item: INodeOrPage) {
    this.schema[item.id] = item
    Immui.add(this.schema, [item.id], item)
    SchemaDiff.atomAddDiff(item.id, item)
  }
  removeItem(item: INodeOrPage) {
    Immui.delete(this.schema, [item.id])
    SchemaDiff.atomRemoveDiff(item.id, item)
  }
  itemAdd(item: ISchemaItem, keypath: (ISchemaPropKey | (string & {}) | number)[], value: any) {
    Immui.add(item, keypath, value)
    SchemaDiff.atomAddDiff(`/${item.id}/${keypath.join('/')}`, value)
  }
  itemReset(item: ISchemaItem, keypath: (ISchemaPropKey | (string & {}) | number)[], value: any) {
    const oldValue = Immui.reset(item, keypath, value)
    SchemaDiff.atomReplaceDiff(`/${item.id}/${keypath.join('/')}`, value, oldValue)
  }
  itemDelete(item: ISchemaItem, keypath: (ISchemaPropKey | (string & {}) | number)[]) {
    const oldValue = Immui.delete(item, keypath)
    SchemaDiff.atomRemoveDiff(`/${item.id}/${keypath.join('/')}`, oldValue)
  }
  itemGet<T = any>(item: ISchemaItem, keypath: (ISchemaPropKey | (string & {}) | number)[]) {
    return Immui.get<T>(item, keypath)
  }
  commitNewSchema() {
    this.schema = Immui.commit(this.schema)
  }
  find<T extends ISchemaItem>(id: ID): T {
    return this.schema[id] as T
  }
  applyPatch(patches: IPatch[]) {
    //@ts-ignore
    return diffApply(this.schema, patches, jsonPatchPathConverter)
  }
  registerListener(type: ISchemaChangeType, callback: ISchemaListener['callback']) {
    this.listenerMap.set(type, callback)
  }
  broadcast(operation: ISchemaOperation) {
    this.listenerMap.get(operation.changeType)?.(operation)
  }
  commitOperation(
    changeType: ISchemaChangeType,
    changeIds: ID[],
    description: string,
    option?: Partial<ISchemaOperation>
  ) {
    const id = nanoid()
    const diff = SchemaDiff.commitOperateDiff(description)
    const timestamp = performance.now()
    const operation = { id, diff, changeIds, changeType, description, timestamp, ...option }
    this.operationList.push(operation)
    this.broadcast(operation)
    this.commitNewSchema()
  }
  commitHistory(description: string) {
    SchemaHistory.commit(description)
  }
}

export const Schema = new SchemaService()
