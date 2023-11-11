import autoBind from 'auto-bind'
import { makeObservable, toJS } from 'mobx'
import { Delete } from '~/helper/utils'
import { INode, INodeParent, IPage, ISchema } from '~/service/schema/type'
import { EditorService } from '../editor/editor'
import { DefaultSchema } from './default'

export class SchemaService {
  nodeMap: Record<string, INode> = {}
  pages: IPage[] = []
  selectedNodeIds: string[] = []
  selectedPageId: string = ''
  default: DefaultSchema
  private _meta?: ISchema['meta']
  get meta() {
    return this._meta!
  }
  constructor(private editor: EditorService) {
    autoBind(this)
    makeObservable(this, {
      pages: true,
      selectedNodeIds: true,
      selectedPageId: true,
    })
    this.default = new DefaultSchema(this)
  }
  getSchema() {
    return {
      meta: this.meta,
      nodes: this.nodeMap,
      pages: toJS(this.pages),
    }
  }
  setSchema({ meta, nodes, pages }: ISchema) {
    this._meta = meta
    this.nodeMap = nodes
    this.pages = pages
  }
  addNode(node: INode) {
    this.nodeMap[node.id] = node
    return this.nodeMap[node.id]!
  }
  setNodeParent(id: string, parentId: string) {
    this.findNode(id).parentId = parentId
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
  newPage() {
    this.pages.push(this.default.page())
  }
  deletePage(id: string) {
    if (this.pages.length <= 1) return
    this.pages = this.pages.filter((page) => page.id !== id)
    this.selectPage(this.pages[0].id)
  }
  findPage(id: string) {
    return this.pages.find((page) => page.id === id)
  }
  selectPage(id: string) {
    this.selectedPageId = id
  }
}
