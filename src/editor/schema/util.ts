import autobind from 'class-autobind-decorator'
import { createCache } from '~/shared/cache'
import { SchemaNode } from './node'
import { SchemaPage } from './page'
import { Schema } from './schema'
import { IFrame, IGroup, INode, INodeParent, IPage } from './type'

type ITraverseData = {
  id: string
  node: INode
  index: number
  depth: number
  childIds: string[] | undefined
  ancestors: string[]
  abort: AbortController
  upLevelRef: ITraverseData | undefined
}
type ITraverseCallback = (arg: ITraverseData) => any

type INodeRuntime = {
  ancestorIds: string[]
}

@autobind
export class SchemaUtilService {
  nodeRuntimeCache = createCache<INodeRuntime>()
  init() {
    this.initNodeRuntime()
  }
  find(id: string) {
    let res = SchemaNode.find(id)
    if (!res && this.isPage(id)) return SchemaPage.find(id)
    return res
  }
  findAncestors(id: string) {
    const ancestors = <(INode | IPage)[]>[]
    let ancestor = this.find(id)
    while (ancestor && 'parentId' in ancestor) {
      ancestor = this.find(ancestor.parentId)
      ancestor && ancestors.push(ancestor)
    }
    return ancestors
  }
  findParent(id: string) {
    const { parentId } = SchemaNode.find(id)
    if (this.isPage(parentId)) return SchemaPage.find(parentId)
    const node = SchemaNode.find(parentId)
    if ('childIds' in node) return node
  }
  insertBefore(parent: INodeParent | IPage, node: INode, anotherId: string) {
    const index = parent.childIds.findIndex((i) => i === anotherId)
    SchemaNode.connectAt(parent, node, index - 1)
  }
  insertAfter(parent: INodeParent | IPage, node: INode, anotherId: string) {
    const index = parent.childIds.findIndex((i) => i === anotherId)
    SchemaNode.connectAt(parent, node, index + 1)
  }
  getChildIds(id: string) {
    if (this.isPage(id)) return SchemaPage.find(id)?.childIds || []
    const node = SchemaNode.find(id)
    return 'childIds' in node ? node.childIds : []
  }
  getChildren(id: string) {
    return this.getChildIds(id).map((id) => SchemaNode.find(id))
  }
  isPage(id: string) {
    return id.startsWith('page')
  }
  isFrame(id: string) {
    return SchemaNode.find(id).type === 'frame'
  }
  isPageFrame(id: string) {
    const node = SchemaNode.find(id)
    return node.type === 'frame' && this.isPage(node.parentId)
  }
  isContainerNode(target: string | INode): target is IFrame | IGroup {
    const node = typeof target === 'string' ? SchemaNode.find(target) : target
    return 'childIds' in node
  }
  parentIsPage(id: string) {
    return SchemaNode.find(id).parentId.startsWith('page')
  }
  traverse(callback: ITraverseCallback, bubbleCallback?: ITraverseCallback) {
    this.traverseIds(SchemaPage.currentPage.value.childIds, callback, bubbleCallback)
  }
  traverseFromSomeId(id: string, callback: ITraverseCallback, bubbleCallback?: ITraverseCallback) {
    let canTraverse = false
    this.traverse(
      (props) => {
        if (props.id === id) canTraverse = true
        if (!canTraverse) return
        return callback(props)
      },
      (props) => {
        if (props.id === id) props.abort.abort()
        bubbleCallback?.(props)
      }
    )
  }
  traverseIds(ids: string[], callback: ITraverseCallback, bubbleCallback?: ITraverseCallback) {
    const abort = new AbortController()
    const traverse = (ids: string[], depth: number, upLevelRef?: ITraverseData) => {
      ids.forEach((id, index) => {
        if (abort.signal.aborted) return
        const node = SchemaNode.find(id)
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
  logSchema() {
    const newSchema = structuredClone(Schema.getSchema())
    console.log(newSchema)
  }
  private initNodeRuntime() {
    this.traverse(({ id, ancestors }) => {
      const runtime = <INodeRuntime>{}
      runtime.ancestorIds = ancestors
      this.nodeRuntimeCache.set(id, runtime)
    })
  }
}

export const SchemaUtil = new SchemaUtilService()
