import { toJS } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { autobind } from '~/editor/utility/decorator'
import { SchemaNodeService, injectSchemaNode } from './node'
import { SchemaPageService, injectSchemaPage } from './page'
import { IMeta, ISchema } from './type'

@autobind
@injectable()
export class SchemaService {
  private meta!: IMeta
  constructor(
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectSchemaPage private SchemaPage: SchemaPageService
  ) {}
  setMeta(option: Partial<IMeta>) {
    this.meta = { ...this.meta, ...option }
  }
  getSchema() {
    return {
      meta: this.meta,
      nodes: toJS(this.SchemaNode.nodeMap),
      pages: toJS(this.SchemaPage.pages),
    }
  }
  setSchema({ meta, nodes, pages }: ISchema) {
    this.meta = meta
    this.SchemaNode.setMap(nodes)
    this.SchemaPage.setPages(pages)
  }
}

export const injectSchema = inject(SchemaService)
