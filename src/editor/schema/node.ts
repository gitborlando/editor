import { Lambda, intercept, makeObservable, observable } from 'mobx'
import { delay, inject, injectable } from 'tsyringe'
import { autobind } from '~/helper/decorator'
import { Delete, numberHalfFix } from '../utils'
import { SchemaPageService } from './page'
import { INode } from './type'

type INodeRuntime = {
  observed: boolean
  interceptDisposers: Lambda[]
}

@autobind
@injectable()
export class SchemaNodeService {
  @observable selectedIds: string[] = []
  @observable dirtyIds: string[] = []
  nodeMap: Record<string, INode> = {}
  private nodeRuntimeMap: Record<string, INodeRuntime> = {}
  constructor(
    @inject(delay(() => SchemaPageService)) private schemaPageService: SchemaPageService
  ) {
    makeObservable(this)
  }
  setMap(map: typeof this.nodeMap) {
    this.nodeMap = map
    Object.keys(this.nodeMap).forEach(this.initNodeRuntime)
  }
  add(node: INode) {
    this.nodeMap[node.id] = node
    this.initNodeRuntime(node.id)
    return this.observeNode(node.id)
  }
  delete(id: string) {
    const node = this.find(id)
    Delete(this.nodeMap, node.id)
    if ('childIds' in node) node.childIds.forEach((i) => this.delete(i))
    // const parent = this.find(node.parentId) as INodeParent
    // Delete(parent.childIds, (id) => id === node.id)
    this.deleteNodeRuntime(id)
  }
  find(id: string) {
    return this.nodeMap[id]
  }
  select(id: string) {
    this.selectedIds.push(id)
  }
  clearSelection() {
    this.selectedIds.length = 0
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
  collectDirty(id: string) {
    this.dirtyIds.push(id)
  }
  observeNode(id: string) {
    const node = this.find(id)
    const nodeRuntime = this.findNodeRuntime(id)
    if (nodeRuntime.observed) return node
    const observedNode = observable(node)
    this.nodeMap[id] = observedNode
    this.interceptProperty(observedNode)
    nodeRuntime.observed = true
    return observedNode
  }
  private initNodeRuntime(id: string) {
    return (this.nodeRuntimeMap[id] = {
      observed: false,
      interceptDisposers: [],
    })
  }
  private findNodeRuntime(id: string) {
    return this.nodeRuntimeMap[id]
  }
  private deleteNodeRuntime(id: string) {
    this.findNodeRuntime(id).interceptDisposers.forEach((dispose) => dispose())
    Delete(this.nodeRuntimeMap, id)
  }
  private interceptProperty(node: INode) {
    const nodeRuntime = this.findNodeRuntime(node.id)
    const disposer = intercept(node, (ctx) => {
      this.collectDirty(node.id)
      if (ctx.type !== 'update') return ctx
      if ((<(keyof INode)[]>['x', 'y', 'width', 'height']).includes(<keyof INode>ctx.name)) {
        ctx.newValue = numberHalfFix(ctx.newValue)
      }
      return ctx
    })
    nodeRuntime.interceptDisposers.push(disposer)
  }
}

export const injectSchemaNode = inject(SchemaNodeService)
