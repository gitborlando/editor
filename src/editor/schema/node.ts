import { Lambda, intercept, makeObservable, observable } from 'mobx'
import { delay, inject, injectable } from 'tsyringe'
import { autobind } from '~/helper/decorator'
import { Delete } from '../utils'
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
    Object.keys(this.nodeMap).forEach((id) => this.createNodeRuntime(id))
  }
  add(node: INode) {
    this.nodeMap[node.id] = node
    this.createNodeRuntime(node.id)
    this.intercept(node)
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
  observe(id: string) {
    const node = this.find(id)
    const nodeRuntime = this.findNodeRuntime(id) || this.createNodeRuntime(id)
    if (nodeRuntime.observed) return
    this.nodeMap[id] = observable(node)
    this.intercept(node)
    nodeRuntime.observed = true
  }
  private createNodeRuntime(id: string) {
    this.nodeRuntimeMap[id] = {
      observed: true,
      interceptDisposers: [],
    }
  }
  private findNodeRuntime(id: string) {
    return this.nodeRuntimeMap[id]
  }
  private deleteNodeRuntime(id: string) {
    this.findNodeRuntime(id).interceptDisposers.forEach((dispose) => dispose())
    Delete(this.nodeRuntimeMap, id)
  }
  private intercept(node: INode) {
    const properties = <(keyof INode)[]>['x', 'y', 'width', 'height']
    properties.forEach((i) => {
      const disposer = intercept(node, i, (ctx) => {
        ctx.newValue = Number((ctx.newValue as number).toFixed(2))
        return ctx
      })
      this.findNodeRuntime(node.id).interceptDisposers.push(disposer)
    })
  }
}

export const injectSchemaNode = inject(SchemaNodeService)
