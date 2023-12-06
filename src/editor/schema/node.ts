import { IObjectDidChange, Lambda, intercept, makeObservable, observable, observe } from 'mobx'
import { delay, inject, injectable } from 'tsyringe'
import { RunInAction, Watch, autobind } from '~/editor/utility/decorator'
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
  @observable selectIds: Set<string> = new Set()
  @observable dirtyIds: Set<string> = new Set()
  nodeMap: Record<string, INode> = {}
  private nodeRuntimeMap: Record<string, INodeRuntime> = {}
  private flushDirtyNodeCallbacks: ((id: string) => void)[] = []
  constructor(@inject(delay(() => SchemaPageService)) private SchemaPage: SchemaPageService) {
    makeObservable(this)
    this.autoOnHoverObserve()
  }
  setMap(map: typeof this.nodeMap) {
    this.nodeMap = map
    Object.keys(this.nodeMap).forEach(this.initNodeRuntime)
    this.initialized = true
  }
  add(node: INode) {
    this.nodeMap[node.id] = node
    this.initNodeRuntime(node.id)
    return this.observe(node.id)
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
    if (this.selectIds.has(id)) return
    this.hoverId = id
    this.collectDirty(id)
  }
  unHover(id: string) {
    this.hoverId = ''
    this.collectDirty(id)
  }
  select(id: string) {
    this.selectIds.add(id)
    this.collectDirty(id)
  }
  unSelect(id: string) {
    this.selectIds.delete(id)
    this.collectDirty(id)
  }
  @RunInAction
  clearSelection() {
    this.selectIds.forEach(this.collectDirty)
    this.selectIds = new Set()
  }
  connect(id: string, parentId: string) {
    const nodeParent = this.find(parentId)
    if (nodeParent) {
      if ('childIds' in nodeParent) nodeParent.childIds.push(id)
    } else {
      this.SchemaPage.find(parentId)?.childIds.push(id)
    }
  }
  disconnect(id: string, parentId: string) {
    const nodeParent = this.find(parentId)
    if (nodeParent) {
      if ('childIds' in nodeParent) Delete(nodeParent.childIds, id)
    } else {
      Delete(this.SchemaPage.find(parentId)?.childIds || [], id)
    }
  }
  collectDirty(id: string) {
    this.dirtyIds.add(id)
  }
  onFlushDirty(callback: (id: string) => void) {
    this.flushDirtyNodeCallbacks.push(callback)
  }
  flushDirty() {
    this.dirtyIds.forEach((id) => {
      this.vectorBoundChangeApplyToPoints(id)
      this.flushDirtyNodeCallbacks.forEach((flush) => flush(id))
      this.dirtyIds.delete(id)
      this.findNodeRuntime(id).oneTickChangeRecord = {}
    })
  }
  private observe(id: string) {
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
  @Watch('hoverId')
  private autoOnHoverObserve() {
    if (this.hoverId === '') return
    this.observe(this.hoverId)
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
      this.collectDirty(node.id)
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
