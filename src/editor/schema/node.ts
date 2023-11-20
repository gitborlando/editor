import autoBind from 'auto-bind'
import { makeObservable } from 'mobx'
import { Delete } from '../utils'
import { SchemaService } from './schema'
import { INode } from './type'

export class SchemaNode {
  map: Record<string, INode> = {}
  selectedNodeIds: string[] = []
  constructor(private schema: SchemaService) {
    autoBind(this)
    makeObservable(this, {
      selectedNodeIds: true,
    })
  }
  setMap(map: typeof this.map) {
    this.map = map
  }
  add(node: INode) {
    this.map[node.id] = node
    return this.map[node.id]!
  }
  delete(id: string) {
    const node = this.map[id]
    Delete(this.map, node.id)
    if ('childIds' in node) node.childIds.forEach((i) => this.delete(i))
    // const parent = this.find(node.parentId) as INodeParent
    // Delete(parent.childIds, (id) => id === node.id)
  }
  copy() {}
  find(id: string) {
    return this.map[id]
  }
  findThen(id: string, callback: (node: INode) => void) {
    const node = this.find(id)
    node && callback(node)
  }
  select(id: string) {
    this.selectedNodeIds.push(id)
  }
  connect(id: string, parentId: string, isPage = false) {
    this.find(id).parentId = parentId
    if (isPage) {
      this.schema.page.find(parentId)?.childIds.push(id)
    } else {
      const parent = this.find(id)
      if ('childIds' in parent) parent.childIds.push(id)
    }
  }
  disconnect(id: string, parentId: string, isPage = false) {
    if (isPage) {
      const childIds = this.schema.page.find(parentId)?.childIds || []
      Delete(childIds, id)
    } else {
      const parent = this.find(id)
      if ('childIds' in parent) Delete(parent.childIds, id)
    }
  }
}
