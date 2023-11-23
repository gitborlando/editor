import { toJS } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { autobind } from '~/helper/decorator'
import { SchemaNodeService, injectSchemaNode } from './node'
import { SchemaPageService, injectSchemaPage } from './page'
import { IMeta, ISchema } from './type'

@autobind
@injectable()
export class SchemaService {
  private meta!: IMeta
  constructor(
    @injectSchemaNode private schemaNodeService: SchemaNodeService,
    @injectSchemaPage private schemaPageService: SchemaPageService
  ) {}
  setMeta(option: Partial<IMeta>) {
    this.meta = { ...this.meta, ...option }
  }
  getSchema() {
    return {
      meta: this.meta,
      nodes: this.schemaNodeService.nodeMap,
      pages: toJS(this.schemaPageService.pages),
    }
  }
  setSchema({ meta, nodes, pages }: ISchema) {
    this.meta = meta
    this.schemaNodeService.setMap(nodes)
    this.schemaPageService.setPages(pages)
  }
}

export const injectSchema = inject(SchemaService)
