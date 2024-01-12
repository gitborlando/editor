import { nanoid } from 'nanoid'
import { autobind } from '~/shared/decorator'
import { createSignal } from '~/shared/signal'
import { SchemaNode } from './node'
import { SchemaPage } from './page'
import { IMeta, ISchema } from './type'

@autobind
export class SchemaService {
  inited = createSignal(false)
  private meta!: IMeta
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
  setSchema({ meta, nodes, pages }: ISchema) {
    this.meta = meta
    SchemaNode.setMap(nodes)
    SchemaPage.pages.value = pages
  }
  createId() {
    return this.meta.version + nanoid()
  }
}

export const Schema = new SchemaService()
