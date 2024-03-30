import autobind from 'class-autobind-decorator'
import { nanoid } from 'nanoid'
import { createSignal } from '~/shared/signal'
import { SchemaNode } from './node'
import { SchemaPage } from './page'
import { IMeta, ISchema } from './type'

@autobind
export class SchemaService {
  inited = createSignal(false)
  afterSetSchema = createSignal<ISchema>()
  meta!: IMeta
  setMeta(option: Partial<IMeta>) {
    this.meta = { ...this.meta, ...option }
  }
  getSchema() {
    return {
      meta: this.meta,
      nodes: SchemaNode.nodeMap,
      pages: SchemaPage.pages.value,
    }
  }
  setSchema(schema: ISchema) {
    const { meta, nodes, pages } = schema
    this.meta = meta
    SchemaNode.setMap(nodes)
    SchemaPage.pages.value = pages
    this.afterSetSchema.dispatch(schema)
  }
  createId() {
    return this.meta.version + nanoid()
  }
}

export const Schema = new SchemaService()
