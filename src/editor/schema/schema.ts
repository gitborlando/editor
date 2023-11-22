import { toJS } from 'mobx'
import { autoBind } from '~/helper/decorator'
import { SchemaNodeService } from './node'
import { SchemaPageService } from './page'
import { ISchema } from './type'

@autoBind
export class SchemaService {
  private _meta?: ISchema['meta']
  constructor(
    private schemaNodeService: SchemaNodeService,
    private schemaPageService: SchemaPageService
  ) {}
  get meta() {
    return this._meta!
  }
  getSchema() {
    return {
      meta: this.meta,
      nodes: this.schemaNodeService.nodeMap,
      pages: toJS(this.schemaPageService.pages),
    }
  }
  setSchema({ meta, nodes, pages }: ISchema) {
    this._meta = meta
    this.schemaNodeService.setMap(nodes)
    this.schemaPageService.setPages(pages)
  }
}
