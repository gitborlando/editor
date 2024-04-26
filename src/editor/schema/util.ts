import autobind from 'class-autobind-decorator'
import { OperateMeta } from '../operate/meta'
import { OperateNode } from '../operate/node'
import { Schema } from './schema'
import { ID, INode, INodeParent, ISchemaItem } from './type'

export type ITraverseData = {
  id: ID
  node: INode
  index: number
  depth: number
  childIds: string[] | undefined
  ancestors: string[]
  abort: AbortController
  upLevelRef: ITraverseData | undefined
  custom?: any
}
type ITraverseCallback = (arg: ITraverseData) => any

@autobind
export class SchemaUtilService {
  findAncestors(id: ID) {
    const ancestors = <ISchemaItem[]>[]
    let ancestor = Schema.find(id)
    while (ancestor && 'parentId' in ancestor) {
      ancestor = Schema.find(ancestor.parentId)
      ancestor && ancestors.push(ancestor)
    }
    return ancestors
  }
  deleteSelectNodes() {
    if (OperateNode.selectIds.value.size) {
      this.traverseDelete(OperateNode.selectIds.value)
    }
  }
  traverseDelete(ids: Set<string>) {
    const deleteNodes: INode[] = []
    this.traverseIds([...ids], ({ node }) => deleteNodes.push(node))
    OperateNode.removeNodes(deleteNodes)
  }
  insertBefore(parent: INodeParent, node: INode, another: INode) {
    let index = parent.childIds.findIndex((i) => i === another.id)
    OperateNode.insertAt(parent, node, index)
  }
  insertAfter(parent: INodeParent, node: INode, another: INode) {
    const index = parent.childIds.findIndex((i) => i === another.id)
    OperateNode.insertAt(parent, node, index + 1)
  }
  getChildren(id: ID | INodeParent) {
    const childIds = (typeof id !== 'string' ? id : Schema.find<INodeParent>(id)).childIds || []
    return childIds.map((id) => Schema.find<INode>(id))
  }
  isPage(id: ID) {
    return id.startsWith('page_')
  }
  is<T extends ISchemaItem>(item: ISchemaItem, type: ISchemaItem['type']): item is T {
    return item.type === type
  }
  isById(id: ID, type: ISchemaItem['type'] | 'nodeParent'): boolean {
    if (type === 'nodeParent') return ['page', 'frame', 'group'].includes(Schema.find(id).type)
    return Schema.find(id).type === type
  }
  isPageFrame(id: ID) {
    const node = Schema.find(id)
    return node.type === 'frame' && this.isPage(node.parentId)
  }
  traverseCurPageChildIds(callback: ITraverseCallback, bubbleCallback?: ITraverseCallback) {
    this.traverseIds(OperateMeta.curPage.value.childIds, callback, bubbleCallback)
  }
  traverseIds(ids: string[], callback: ITraverseCallback, bubbleCallback?: ITraverseCallback) {
    const abort = new AbortController()
    const traverse = (ids: string[], depth: number, upLevelRef?: ITraverseData) => {
      ids.forEach((id, index) => {
        if (abort.signal.aborted) return
        const node = Schema.find<INode>(id)
        const childIds = 'childIds' in node ? node.childIds : undefined
        const ancestors = upLevelRef ? [...upLevelRef.ancestors, upLevelRef.id] : []
        const props = { id, node, index, childIds, depth, abort, upLevelRef, ancestors }
        const isContinue = callback(props)
        if (isContinue !== false && childIds) traverse(childIds, depth + 1, props)
        bubbleCallback?.(props)
      })
    }
    traverse(ids, 0)
  }
  reverse(id: ID, callback: (node: INode) => any) {
    let node = Schema.find<INode>(id)
    while (node) {
      callback(node)
      node = Schema.find(node.parentId)
    }
  }
}

export const SchemaUtil = new SchemaUtilService()
