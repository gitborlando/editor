import autoBind from 'auto-bind'
import { makeObservable, toJS } from 'mobx'
import { Delete } from '~/helper/utils'
import { INode, INodeParent, ISchema } from '~/service/schema/type'
import { EditorService } from '../editor/editor'
import { DefaultSchema } from './default'
import { SchemaPage } from './page'

export class SchemaService {
  nodeMap: Record<string, INode> = {}
  selectedNodeIds: string[] = []
  default: DefaultSchema
  page: SchemaPage
  private _meta?: ISchema['meta']
  get meta() {
    return this._meta!
  }
  constructor(private editor: EditorService) {
    autoBind(this)
    makeObservable(this, {
      selectedNodeIds: true,
    })
    this.default = new DefaultSchema(this)
    this.page = new SchemaPage(this, this.editor)
  }
  getSchema() {
    return {
      meta: this.meta,
      nodes: this.nodeMap,
      pages: toJS(this.page.pages),
    }
  }
  setSchema({ meta, nodes, pages }: ISchema) {
    this._meta = meta
    this.nodeMap = nodes
    this.page.setPages(pages)
  }
  addNode(node: INode) {
    this.nodeMap[node.id] = node
    return this.nodeMap[node.id]!
  }
  connectToParent(id: string, parentId: string, isPage = false) {
    this.findNode(id).parentId = parentId
    if (isPage) {
      this.page.find(parentId)?.childIds.push(id)
    } else {
      const parent = this.findNode(id)
      if ('childIds' in parent) parent.childIds.push(id)
    }
  }
  deleteNode(id: string) {
    const node = this.nodeMap[id]
    const parent = this.findNode(node.parentId) as INodeParent
    Delete(this.nodeMap, node.id)
    Delete(parent.childIds, (id) => id === node.id)
  }
  copyNode() {}
  findNode(id: string) {
    return this.nodeMap[id]
  }
  findNodeThen(id: string, callback: (schema: INode) => void) {
    const node = this.findNode(id)
    node && callback(node)
  }
  selectNode(id: string) {
    this.selectedNodeIds.push(id)
  }
}
