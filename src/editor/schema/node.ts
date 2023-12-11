import {
  IObjectDidChange,
  IObjectWillChange,
  Lambda,
  intercept,
  makeObservable,
  observable,
  observe,
  when,
} from 'mobx'
import { delay, inject, injectable } from 'tsyringe'
import { RunInAction, Watch, autobind } from '~/shared/decorator'
import { XY } from '~/shared/helper/xy'
import { Delete } from '~/shared/utils'
import { max, min, numberHalfFix, rcos, rsin } from '../math/base'
import { OBB } from '../math/obb'
import { OptimizeCache } from '../optimize/cache'
import { PixiService, injectPixi } from '../stage/pixi'
import { SchemaPageService } from './page'
import { INode } from './type'

type INodeRuntime = {
  nodeRuntime: INodeRuntime
  observed: boolean
  disposers: Lambda[]
  oneTickChange: {
    [K in keyof INode]?: { new: INode[K]; old: INode[K] }
  }
  changedProps: Set<keyof INode>
  geometryChanged: boolean
  OBB: OBB
}

@autobind
@injectable()
export class SchemaNodeService {
  @observable initialized = false
  @observable hoverId = ''
  @observable selectIds: Set<string> = new Set()
  @observable dirtyIds: Set<string> = new Set()
  nodeMap: Record<string, INode> = {}
  nodeEntries: [string, INode][] = []
  private nodeRuntimeMap: Record<string, INodeRuntime> = {}
  private flushDirtyCallbacks: ((id: string) => void)[] = []
  constructor(
    @injectPixi private Pixi: PixiService,
    @inject(delay(() => SchemaPageService)) private SchemaPage: SchemaPageService
  ) {
    makeObservable(this)
    when(() => this.Pixi.initialized && this.initialized).then(() => {
      this.Pixi.app.ticker.add(this.flushDirty)
      this.autoIdleObserve()
      this.autoOnHoverObserve()
      this.autoOnSelectObserve()
    })
    this.onFlushDirty((id) => {
      this.reconcilePropChange(id)
      this.vectorChangeToPoints(id)
    })
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
    OptimizeCache.GetOrNew('drawPathCache').delete(id)
  }
  find(id: string) {
    return this.nodeMap[id]
  }
  findNodeRuntime(id: string) {
    return this.nodeRuntimeMap[id]
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
  hover(id: string) {
    this.hoverId = id
  }
  unHover(id: string) {
    this.hoverId = ''
  }
  select(id: string) {
    if (this.selectIds.has(id)) return
    this.selectIds.add(id)
    this.collectDirty(id)
  }
  unSelect(id: string) {
    if (!this.selectIds.has(id)) return
    this.selectIds.delete(id)
    this.collectDirty(id)
  }
  @RunInAction
  clearSelection() {
    this.selectIds.forEach(this.collectDirty)
    this.selectIds = new Set()
  }
  collectDirty(id: string) {
    this.dirtyIds.add(id)
  }
  onFlushDirty(callback: (id: string) => void) {
    this.flushDirtyCallbacks.push(callback)
  }
  flushDirty() {
    this.dirtyIds.forEach((id) => {
      this.flushDirtyCallbacks.forEach((flush) => flush(id))
      this.dirtyIds.delete(id)
      const { oneTickChange, changedProps, nodeRuntime } = this.findNodeRuntime(id)
      changedProps.clear()
      nodeRuntime.geometryChanged = false
      Object.values(oneTickChange).forEach((prop) => (prop.old = prop.new))
    })
  }
  private initNodeRuntime(id: string) {
    const { centerX, centerY, width, height, rotation } = this.find(id)
    const obb = new OBB(centerX, centerY, width, height, rotation)
    const nodeRuntime: INodeRuntime = {
      nodeRuntime: <any>null,
      observed: false,
      disposers: [],
      changedProps: new Set(),
      oneTickChange: {},
      OBB: obb,
      geometryChanged: false,
    }
    nodeRuntime.nodeRuntime = nodeRuntime
    this.nodeRuntimeMap[id] = nodeRuntime
  }
  private deleteNodeRuntime(id: string) {
    this.findNodeRuntime(id).disposers.forEach((dispose) => dispose())
    Delete(this.nodeRuntimeMap, id)
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
  private autoIdleObserve() {
    const ids = Object.keys(this.nodeMap)
    requestIdleCallback(() => {
      while (ids.length) {
        const id = ids.pop()
        id && this.observe(id)
      }
    })
  }
  @Watch('hoverId')
  private autoOnHoverObserve() {
    if (this.hoverId === '') return
    this.observe(this.hoverId)
  }
  @Watch('selectIds.values()')
  private autoOnSelectObserve() {
    this.selectIds.forEach(this.observe)
  }
  private listenNodeWillChange(node: INode) {
    const disposer = intercept(node, (ctx) => {
      if (ctx.type !== 'update') return ctx
      this.fixNodeChange(ctx)
      return ctx
    })
    this.findNodeRuntime(node.id).disposers.push(disposer)
  }
  private fixNodeChange(ctx: IObjectWillChange & { type: 'update' | 'add' }) {
    const propName = <keyof INode>ctx.name.toString()
    if (propName.match(/x|y|width|height|rotation/)) {
      ctx.newValue = numberHalfFix(ctx.newValue)
    }
    if (propName.match(/width|height/)) {
      ctx.newValue = max(0, ctx.newValue)
    }
    if (propName.match(/rotation/)) {
      ctx.newValue = max(-180, min(180, ctx.newValue))
    }
  }
  private listenNodeDidChange(node: INode) {
    const disposer = observe(node, (ctx) => {
      if (ctx.type !== 'update') return ctx
      this.collectDirty(node.id)
      this.recordOneTickChange(node.id, ctx)
      return ctx
    })
    this.findNodeRuntime(node.id).disposers.push(disposer)
  }
  private recordOneTickChange(id: string, ctx: IObjectDidChange & { type: 'update' }) {
    const { oneTickChange, changedProps, nodeRuntime } = this.findNodeRuntime(id)
    const propName = <keyof INode>ctx.name.toString()
    changedProps.add(propName)
    if (!oneTickChange[propName]) {
      ;(<any>oneTickChange[propName]) = {}
      oneTickChange[propName]!.old = ctx.oldValue
    }
    oneTickChange[propName]!.new = ctx.newValue
    if (propName.match(/x|y|width|height|rotation/)) {
      nodeRuntime.geometryChanged = true
    }
  }
  @RunInAction
  private reconcilePropChange(id: string) {
    const node = this.find(id)
    const { oneTickChange, changedProps } = this.findNodeRuntime(id)
    const { x, y, width, height, rotation } = oneTickChange
    if (changedProps.has('x') && x) {
      node.centerX += x.new - x.old
      node.pivotX += x.new - x.old
    }
    if (changedProps.has('y') && y) {
      node.centerY += y.new - y.old
      node.pivotY += y.new - y.old
    }
    if (changedProps.has('width') && width) {
      node.centerX += (rcos(node.rotation) * (width.new - width.old)) / 2
      node.centerY += (rsin(node.rotation) * (width.new - width.old)) / 2
    }
    if (changedProps.has('height') && height) {
      node.centerX += (rsin(node.rotation) * (height.new - height.old)) / 2
      node.centerY -= (rcos(node.rotation) * (height.new - height.old)) / 2
    }
    if (changedProps.has('rotation') && rotation) {
      const originXY = XY.Of(node.centerX, node.centerY)
      XY.Of(node.pivotX, node.pivotY).rotate(originXY, rotation.new).mutate(node)
    }
  }
  @RunInAction
  private vectorChangeToPoints(id: string) {
    const vector = this.find(id)
    if (vector.type !== 'vector') return
    const { width, height } = this.findNodeRuntime(id).oneTickChange
    vector.points.forEach((point) => {
      if (width) {
        point.x *= width.new / width.old
        point.handleLeft && (point.handleLeft.x *= width.new / width.old)
        point.handleRight && (point.handleRight.x *= width.new / width.old)
      }
      if (height) {
        point.y *= height.new / height.old
        point.handleLeft && (point.handleLeft.y *= height.new / height.old)
        point.handleRight && (point.handleRight.y *= height.new / height.old)
      }
    })
  }
}

export const injectSchemaNode = inject(SchemaNodeService)
