import autoBind from 'auto-bind'
import { makeObservable } from 'mobx'
import { Delete } from '~/helper/utils'
import { EditorService } from '../editor/editor'
import { SchemaService } from './schema'
import { INode, INodeParent } from './type'

export class SchemaNode {
  map: Record<string, INode> = {}
  selectedNodeIds: string[] = []
  public constructor(private schema: SchemaService, private editor: EditorService) {
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
  connect(id: string, parentId: string, isPage = false) {
    this.find(id).parentId = parentId
    if (isPage) {
      this.schema.page.find(parentId)?.childIds.push(id)
    } else {
      const parent = this.find(id)
      if ('childIds' in parent) parent.childIds.push(id)
    }
  }
  delete(id: string) {
    const node = this.map[id]
    const parent = this.find(node.parentId) as INodeParent
    Delete(this.map, node.id)
    Delete(parent.childIds, (id) => id === node.id)
  }
  copy() {}
  find(id: string) {
    return this.map[id]
  }
  findThen(id: string, callback: (schema: INode) => void) {
    const node = this.find(id)
    node && callback(node)
  }
  select(id: string) {
    this.selectedNodeIds.push(id)
  }
}
