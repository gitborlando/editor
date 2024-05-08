import autobind from 'class-autobind-decorator'
import { forEach } from 'lodash-es'
import { OperateMeta } from '../operate/meta'
import { Schema } from './schema'
import { ID, INode, INodeParent, ISchemaItem } from './type'

export type ITraverseData = {
  id: ID
  node: INode
  index: number
  depth: number
  childIds: string[] | undefined
  parent: INodeParent
  ancestors: string[]
  abort: AbortController
  upLevelRef: ITraverseData | undefined
  [key: string & {}]: any
}
type ITraverseCallback = (arg: ITraverseData) => any

@autobind
class SchemaUtilService {
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
  getChildren(id: ID | INodeParent) {
    const childIds = (typeof id !== 'string' ? id : Schema.find<INodeParent>(id))?.childIds || []
    return childIds.map((id) => Schema.find<INode>(id))
  }
  traverseCurPageChildIds(callback: ITraverseCallback, bubbleCallback?: ITraverseCallback) {
    this.traverseIds(OperateMeta.curPage.value.childIds, callback, bubbleCallback)
  }
  traverseIds(ids: string[], callback: ITraverseCallback, bubbleCallback?: ITraverseCallback) {
    const abort = new AbortController()
    const traverse = (ids: string[], depth: number, upLevelRef?: ITraverseData) => {
      forEach(ids, (id, index) => {
        if (abort.signal.aborted) return
        const node = Schema.find<INode>(id)
        if (!node) console.log(id, ids)
        const childIds = 'childIds' in node ? node.childIds : undefined
        const parent = <INodeParent>(upLevelRef?.node || Schema.find(node.parentId))
        const ancestors = upLevelRef ? [...upLevelRef.ancestors, upLevelRef.id] : []
        const props = { id, node, index, childIds, depth, abort, upLevelRef, parent, ancestors }
        const isContinue = callback(props)
        if (isContinue !== false && childIds) traverse(childIds, depth + 1, props)
        bubbleCallback?.(props)
      })
    }
    traverse(ids, 0)
  }
}

export const SchemaUtil = new SchemaUtilService()
