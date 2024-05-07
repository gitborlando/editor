import autobind from 'class-autobind-decorator'
import { createCache } from '~/shared/cache'
import { createSignal } from '~/shared/signal/signal'
import { firstOne, flushList } from '~/shared/utils/list'
import { XY } from '~/shared/xy'
import { OBB } from '../math/obb'
import { SchemaHistory } from '../schema/history'
import { Schema } from '../schema/schema'
import { ID, INode, INodeParent } from '../schema/type'
import { SchemaUtil } from '../schema/util'
import { IStageElement } from '../stage/draw/draw'
import { Pixi } from '../stage/pixi'

export type INodeRuntime = {
  expand: boolean
  element: IStageElement
  obb: OBB
}

@autobind
class OperateNodeService {
  datumId = createSignal('')
  datumXY = XY.Of(0, 0)
  hoverIds = createSignal(new Set<ID>())
  selectIds = createSignal(new Set<ID>())
  dirtyIds = new Set<string>()
  beforeFlushDirty = createSignal()
  duringFlushDirty = createSignal('')
  afterFlushDirty = createSignal()
  afterRemoveNodes = createSignal<ID[]>()
  afterCommitSelect = createSignal()
  selectedNodes = createSignal(<INode[]>[])
  private lastSelectedNodeSet = new Set<INode>()
  private nodeRuntimeCache = createCache<ID, INodeRuntime>()
  nodeRuntimeMap = createSignal<Record<ID, INodeRuntime>>({})
  initHook() {
    Pixi.inited.hook(() => {
      Pixi.duringTicker.hook({ id: 'flushDirty' }, this.flushDirty)
    })
    this.datumId.hook((id) => {
      const { obb } = OperateNode.getNodeRuntime(id)
      if (!obb) return (this.datumXY = XY.Of(0, 0))
      this.datumXY = XY.Of(obb.aabb.x, obb.aabb.y)
    })
    this.afterRemoveNodes.hook((ids) => {
      ids.forEach((id) => OperateNode.dirtyIds.delete(id))
      OperateNode.selectIds.dispatch((ids) => ids.clear())
      OperateNode.hoverIds.dispatch((hoverIds) => ids.forEach((id) => hoverIds.delete(id)))
    })
    Schema.schemaChanged.hook(() => {
      const selectedNodes = Schema.client.selectIds.map(Schema.find<INode>)
      const selectionChange = () => {
        this.lastSelectedNodeSet = new Set(selectedNodes)
        this.selectIds.value = new Set(Schema.client.selectIds)
        this.selectedNodes.dispatch(selectedNodes)
      }
      if (this.lastSelectedNodeSet.size !== selectedNodes.length) {
        return selectionChange()
      }
      for (const node of selectedNodes) {
        if (!this.lastSelectedNodeSet.has(node)) return selectionChange()
      }
    })
  }
  get selectNodes() {
    const nodes = <INode[]>[]
    this.selectIds.value.forEach((id) => nodes.push(Schema.find(id)))
    return nodes
  }
  hover(id: ID) {
    if (this.hoverIds.value.has(id)) return
    this.hoverIds.dispatch((ids) => ids.add(id))
  }
  unHover(id: ID) {
    if (!this.hoverIds.value.has(id)) return
    this.hoverIds.dispatch((ids) => ids.delete(id))
  }
  clearHover() {
    this.hoverIds.dispatch(new Set())
  }
  select(id: ID) {
    if (this.selectIds.value.has(id)) return
    this.selectIds.dispatch((ids) => ids.add(id))
  }
  unSelect(id: ID) {
    if (!this.selectIds.value.has(id)) return
    this.selectIds.dispatch((ids) => ids.delete(id))
  }
  clearSelect() {
    this.selectIds.dispatch(new Set())
  }
  commitSelect() {
    const selectIdArr = [...this.selectIds.value]
    this.autoGetDatumId(this.selectIds.value)
    Schema.itemReset(Schema.meta, ['clients', Schema.client.id, 'selectIds'], selectIdArr)
    Schema.commitOperation(`选择节点`)
  }
  commitFinalSelect() {
    this.commitSelect()
    Schema.nextSchema()
    SchemaHistory.commit('选择节点')
  }
  collectDirty(id: ID) {
    this.dirtyIds.add(id)
  }
  flushDirty() {
    this.beforeFlushDirty.dispatch()
    flushList(this.dirtyIds, this.duringFlushDirty.dispatch)
    this.afterFlushDirty.dispatch()
  }
  makeSelectDirty() {
    this.selectIds.value.forEach(this.collectDirty)
  }
  addNodes(nodes: INode[]) {
    nodes.forEach(Schema.addItem)
    Schema.commitOperation('添加节点')
  }
  removeNodes(nodes: INode[]) {
    nodes.forEach(Schema.removeItem)
    Schema.commitOperation('移除节点')
  }
  insertAt(parent: INodeParent, node: INode, index?: number) {
    index ??= parent.childIds.length
    Schema.itemAdd(parent, ['childIds', index], node.id)
    Schema.itemReset(node, ['parentId'], parent.id)
    Schema.commitOperation('插入子节点')
    this.setNodeRuntime(parent.id, { expand: true })
  }
  splice(parent: INodeParent, node: INode) {
    const index = parent.childIds.indexOf(node.id)
    Schema.itemDelete(parent, ['childIds', index])
    Schema.itemReset(node, ['parentId'], '')
    Schema.commitOperation('移除子节点')
  }
  traverseDelete(ids: ID[]) {
    SchemaUtil.traverseIds(ids, ({ node, parent }) => {
      this.removeNodes([node])
      this.splice(parent, node)
    })
    Schema.finalOperation('删除节点')
  }
  setNodeRuntime(id: ID, runtime: Partial<INodeRuntime>) {
    const prevRuntime = this.getNodeRuntime(id)
    this.nodeRuntimeCache.set(id, { ...prevRuntime, ...runtime })
  }
  getNodeRuntime(id: ID) {
    return this.nodeRuntimeCache.getSet(id, () => ({
      expand: false,
      obb: new OBB(0, 0, 0, 0, 0),
      element: null!,
    }))
  }
  private autoGetDatumId(selectIds: Set<string>) {
    if (selectIds.size === 0) {
      this.datumId.dispatch('')
    }
    if (selectIds.size === 1) {
      this.datumId.dispatch(Schema.find<INode>(firstOne(selectIds)).parentId)
    }
    if (selectIds.size > 1) {
      const parentIds = new Set<string>()
      selectIds.forEach((id) => parentIds.add(Schema.find<INode>(id).parentId))
      if (parentIds.size === 1) this.datumId.dispatch(firstOne(parentIds))
      if (parentIds.size > 1) this.datumId.dispatch('')
    }
  }
}

export const OperateNode = new OperateNodeService()