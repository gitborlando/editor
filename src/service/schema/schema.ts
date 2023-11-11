import autoBind from 'auto-bind'
import { makeObservable, toJS } from 'mobx'
import { INode, IPage, ISchema } from '~/service/schema/type'
import { EditorService } from '../editor/editor'
import { DefaultSchema } from './default'

export class SchemaService {
  nodeMap: Record<string, INode> = {}
  pages: IPage[] = []
  selectedNodeIds: string[] = []
  selectedPageId: string = ''
  default: DefaultSchema
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
      nodes: toJS(this.nodeMap),
      pages: toJS(this.pages),
    }
  }
  setSchema(schemaObj: ISchema) {
    this.nodeMap = schemaObj.nodes
    this.pages = schemaObj.pages
  }
  addNode(node: INode) {
    this.nodeMap[node.id] = node
    return this.nodeMap[node.id]!
  }
  deleteNode(id: string) {
    delete this.nodeMap[id]
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
