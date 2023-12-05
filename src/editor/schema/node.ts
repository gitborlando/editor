import { IObjectDidChange, Lambda, intercept, makeObservable, observable, observe } from 'mobx'
import { delay, inject, injectable } from 'tsyringe'
import { autobind } from '~/editor/utility/decorator'
import { numberHalfFix } from '../math/base'
import { Delete } from '../utility/utils'
import { SchemaPageService } from './page'
import { INode } from './type'

type INodeRuntime = {
  observed: boolean
  disposers: Lambda[]
  oneTickChangeRecord: {
    [K in keyof INode]?: { new: INode[K]; old: INode[K] }
  }
}

@autobind
@injectable()
export class SchemaNodeService {
  @observable initialized = false
  @observable hoverId = ''
  @observable selectedIds: string[] = []
  @observable dirtyIds: Set<string> = new Set()
  nodeMap: Record<string, INode> = {}
  private nodeRuntimeMap: Record<string, INodeRuntime> = {}
  private flushDirtyNodeCallbacks: ((id: string) => void)[] = []
  constructor(
    @inject(delay(() => SchemaPageService)) private schemaPageService: SchemaPageService
  ) {
    makeObservable(this)
  }
  setMap(map: typeof this.nodeMap) {
    this.nodeMap = map
    Object.keys(this.nodeMap).forEach(this.initNodeRuntime)
    this.initialized = true
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
  findNodeRuntime(id: string) {
    return this.nodeRuntimeMap[id]
  }
  hover(id: string) {
    this.hoverId = id
    if (id === '' || this.findNodeRuntime(id).observed) return
    this.observeNode(id)
  }
  select(id: string) {
    this.selectedIds.push(id)
  }
  clearSelection() {
    this.selectedIds.length = 0
  }
  connect(id: string, parentId: string) {
    const nodeParent = this.find(parentId)
    if (nodeParent) {
      if ('childIds' in nodeParent) nodeParent.childIds.push(id)
    } else {
      this.schemaPageService.find(parentId)?.childIds.push(id)
    }
  }
  disconnect(id: string, parentId: string) {
    const nodeParent = this.find(parentId)
    if (nodeParent) {
      if ('childIds' in nodeParent) Delete(nodeParent.childIds, id)
    } else {
      Delete(this.schemaPageService.find(parentId)?.childIds || [], id)
    }
  }
  collectDirtyNode(id: string) {
    this.dirtyIds.add(id)
  }
  onFlushDirtyNode(callback: (id: string) => void) {
    this.flushDirtyNodeCallbacks.push(callback)
  }
  flushDirtyNode() {
    this.dirtyIds.forEach((id) => {
      this.vectorBoundChangeApplyToPoints(id)
      this.flushDirtyNodeCallbacks.forEach((flush) => flush(id))
      this.dirtyIds.delete(id)
      this.findNodeRuntime(id).oneTickChangeRecord = {}
    })
  }
  observeNode(id: string) {
    const node = this.find(id)
    const nodeRuntime = this.findNodeRuntime(id)
    if (nodeRuntime.observed) return node
    const observedNode = observable(node)
    this.nodeMap[id] = observedNode
    this.listenNodeWillChange(observedNode)
    this.listenNodeDidChange(observedNode)
    nodeRuntime.observed = true
    return observedNode
  }
  private initNodeRuntime(id: string) {
    this.nodeRuntimeMap[id] = {
      observed: false,
      disposers: [],
      oneTickChangeRecord: {},
    }
  }
  private deleteNodeRuntime(id: string) {
    this.findNodeRuntime(id).disposers.forEach((dispose) => dispose())
    Delete(this.nodeRuntimeMap, id)
  }
  private listenNodeWillChange(node: INode) {
    const disposer = intercept(node, (ctx) => {
      if (ctx.type !== 'update') return ctx
      if (ctx.name.toString().match(/x|y|width|height|rotation/)) {
        ctx.newValue = numberHalfFix(ctx.newValue)
      }
      return ctx
    })
    this.findNodeRuntime(node.id).disposers.push(disposer)
  }
  private listenNodeDidChange(node: INode) {
    const { disposers } = this.findNodeRuntime(node.id)
    const disposer = observe(node, (ctx) => {
      if (ctx.type !== 'update') return ctx
      this.collectDirtyNode(node.id)
      this.recordNodeChange(node, ctx)
      return ctx
    })
    disposers.push(disposer)
  }
  private recordNodeChange(node: INode, ctx: IObjectDidChange & { type: 'update' }) {
    const { oneTickChangeRecord } = this.findNodeRuntime(node.id)
    ;(<any>oneTickChangeRecord)[ctx.name.toString()] = {
      new: ctx.newValue,
      old: ctx.oldValue,
    }
  }
  private vectorBoundChangeApplyToPoints(id: string) {
    const vector = this.find(id)
    if (vector.type !== 'vector') return
    const oneTickChangeRecord = this.findNodeRuntime(id).oneTickChangeRecord
    const { width, height } = oneTickChangeRecord
    vector.points.forEach((point) => {
      if (width) point.x *= width.new / width.old
      if (height) point.y *= height.new / height.old
    })
  }
}

export const injectSchemaNode = inject(SchemaNodeService)
