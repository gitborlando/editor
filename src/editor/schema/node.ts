import { makeObservable, observable } from 'mobx'
import { autoBind } from '~/helper/decorator'
import { Delete } from '../utils'
import { SchemaPageService } from './page'
import { INode } from './type'

@autoBind
export class SchemaNodeService {
  @observable selectedIds: string[] = []
  @observable dirtyIds: string[] = []
  nodeMap: Record<string, INode> = {}
  constructor(private schemaPageService: SchemaPageService) {
    makeObservable(this)
  }
  setMap(map: typeof this.nodeMap) {
    this.nodeMap = map
  }
  add(node: INode) {
    this.nodeMap[node.id] = node
    return this.nodeMap[node.id]!
  }
  delete(id: string) {
    const node = this.nodeMap[id]
    Delete(this.nodeMap, node.id)
    if ('childIds' in node) node.childIds.forEach((i) => this.delete(i))
    // const parent = this.find(node.parentId) as INodeParent
    // Delete(parent.childIds, (id) => id === node.id)
  }
  copy() {}
  find(id: string) {
    return this.nodeMap[id]
  }
  findThen(id: string, callback: (node: INode) => void) {
    const node = this.find(id)
    node && callback(node)
  }
  select(id: string) {
    this.selectedIds.push(id)
  }
  connect(id: string, parentId: string, isPage = false) {
    this.find(id).parentId = parentId
    if (isPage) {
      this.schemaPageService.find(parentId)?.childIds.push(id)
    } else {
      const parent = this.find(id)
      if ('childIds' in parent) parent.childIds.push(id)
    }
  }
  disconnect(id: string, parentId: string, isPage = false) {
    if (isPage) {
      const childIds = this.schemaPageService.find(parentId)?.childIds || []
      Delete(childIds, id)
    } else {
      const parent = this.find(id)
      if ('childIds' in parent) Delete(parent.childIds, id)
    }
  }
  observe(id: string) {
    this.nodeMap[id] = observable(this.nodeMap[id])
  }
  collectDirty(id: string) {
    this.dirtyIds.push(id)
  }
}
