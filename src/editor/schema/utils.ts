import { Schema } from 'src/editor/schema/schema'
import { IFrame, INode, INodeParent, IPage, ISchemaItem } from 'src/editor/schema/type'

export type SchemaUtilTraverseData = {
  id: ID
  node: V1.Node
  index: number
  depth: number
  childIds: string[] | undefined
  parent: V1.NodeParent
  ancestors: string[]
  abort: AbortController
  upLevelRef: SchemaUtilTraverseData | undefined
  [key: string & {}]: any
}

type ITraverseCallback = (arg: SchemaUtilTraverseData) => any

export class SchemaUtil2 {
  static isPageById(id: ID) {
    return id.startsWith('page_')
  }

  static is<T extends ISchemaItem>(item: ISchemaItem, type: ISchemaItem['type']): item is T {
    return item.type === type
  }

  static isById(id: ID, type: ISchemaItem['type'] | 'nodeParent'): boolean {
    if (type === 'nodeParent') return ['page', 'frame', 'group'].includes(Schema.find(id).type)
    return Schema.find(id).type === type
  }

  static isNodeParent<T extends { childIds: string[] }>(node: any): node is T {
    return 'childIds' in node
  }

  static isPageFrame(id: ID) {
    const node = Schema.find(id)
    return node.type === 'frame' && this.isPageById(node.parentId)
  }

  static getChildren(id: ID | INodeParent) {
    const childIds = (typeof id !== 'string' ? id : Schema.find<INodeParent>(id))?.childIds || []
    return childIds.map((id) => Schema.find<INode>(id))
  }

  static findAncestor(id: ID | INode, utilFunc?: (node: INode) => boolean) {
    let node = typeof id === 'string' ? Schema.find<INode>(id) : id
    utilFunc ||= (node: INode) => SchemaUtil2.isPageById(node.parentId)
    while (node.parentId) {
      if (utilFunc(node)) return node
      node = Schema.find<INode>(node.parentId)
    }
    return node
  }

  static findParent(node: INode) {
    while (node.parentId) {
      if (SchemaUtil2.is<IFrame>(node, 'frame')) return node
      node = Schema.find<INode>(node.parentId)
    }
    return node
  }

  static traverseCurPageChildIds(callback: ITraverseCallback, bubbleCallback?: ITraverseCallback) {
    const curPage = Schema.find<IPage>(Schema.client.selectPageId)
    const traverse = this.createTraverse({
      finder: (id) => Schema.find<INode>(id),
      callback,
      bubbleCallback,
    })
    traverse(curPage.childIds)
  }

  static createTraverse({
    finder,
    callback,
    bubbleCallback,
  }: {
    finder: (id: ID) => V1.Node
    callback: ITraverseCallback
    bubbleCallback?: ITraverseCallback
  }) {
    const abort = new AbortController()
    const traverse = (ids: string[], depth: number, upLevelRef?: SchemaUtilTraverseData) => {
      ids.forEach((id, index) => {
        if (abort.signal.aborted) return
        const node = finder(id)
        if (node === undefined) return

        const childIds = 'childIds' in node ? node.childIds : undefined
        const parent = <INodeParent>(upLevelRef?.node || finder(node.parentId))
        const ancestors = upLevelRef ? [...upLevelRef.ancestors, upLevelRef.id] : []
        const props = { id, node, index, childIds, depth, abort, upLevelRef, parent, ancestors }
        const isContinue = callback(props)
        if (isContinue !== false && childIds) traverse(childIds, depth + 1, props)
        bubbleCallback?.(props)
      })
    }
    return (ids: string[]) => traverse(ids, 0)
  }
}
