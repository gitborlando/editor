import autoBind from 'auto-bind'
import { makeAutoObservable, toJS } from 'mobx'
import { INode, IPage } from '~/service/schema/type'
import { EditorService } from '../editor/editor'
import { DefaultSchema } from './default'

export class SchemaService {
  nodeMap: Record<string, INode> = {}
  pages: IPage[] = []
  selectedNodeIds: string[] = []
  selectedPageId: string = ''
  Default: DefaultSchema
  constructor(public editor: EditorService) {
    autoBind(this)
    makeAutoObservable(this)
    this.Default = new DefaultSchema(this)
  }
  getSchema() {
    return {
      nodes: toJS(this.nodeMap),
      pages: toJS(this.pages),
    }
  }
  setSchema(schemaObj: { nodes: Record<string, INode>; pages: IPage[] }) {
    this.nodeMap = schemaObj.nodes
    this.pages = schemaObj.pages
  }
  addNode(schema: INode) {
    this.nodeMap[schema.id] = schema
    return this.nodeMap[schema.id]!
  }
  deleteNode(id: string) {
    delete this.nodeMap[id]
  }
  copyNode() {}
  findNode(id: string) {
    return this.nodeMap[id]
  }
  findNodeThen(id: string, callback: (schema: INode) => void) {
    const schema = this.findNode(id)
    schema && callback(schema)
  }
  newPage() {
    this.pages.push(this.Default.page())
  }
  deletePage(id: string) {
    this.pages = this.pages.filter((page) => page.id !== id)
  }
  findPage(id: string) {
    return this.pages.find((page) => page.id === id)
  }
  selectPage(id: string) {
    this.selectedPageId = id
  }
}
