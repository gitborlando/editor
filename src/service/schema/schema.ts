import autoBind from 'auto-bind'
import { toJS } from 'mobx'
import { ISchema } from '~/service/schema/type'
import { EditorService } from '../editor/editor'
import { SchemaDefault } from './default'
import { SchemaFile } from './file'
import { SchemaNode } from './node'
import { SchemaPage } from './page'

export class SchemaService {
  node: SchemaNode
  page: SchemaPage
  file: SchemaFile
  default: SchemaDefault
  private _meta?: ISchema['meta']
  get meta() {
    return this._meta!
  }
  constructor(private editor: EditorService) {
    autoBind(this)

    this.node = new SchemaNode(this, this.editor)
    this.page = new SchemaPage(this, this.editor)
    this.file = new SchemaFile(this, this.editor)
    this.default = new SchemaDefault(this)
  }
  getSchema() {
    return {
      meta: this.meta,
      nodes: this.node.map,
      pages: toJS(this.page.pages),
    }
  }
  setSchema({ meta, nodes, pages }: ISchema) {
    this._meta = meta
    this.node.setMap(nodes)
    this.page.setPages(pages)
  }
}
