import autobind from 'class-autobind-decorator'
import { createCache2 } from '~/shared/cache'
import { createSignal } from '~/shared/signal'
import { XY } from '~/shared/structure/xy'
import { firstOne, flushList } from '~/shared/utils/list'
import { Schema } from '../schema/schema'
import { ID, INode, INodeParent } from '../schema/type'
import { StageElement } from '../stage/element'
import { Pixi } from '../stage/pixi'

export type INodeRuntime = {
  expand: boolean
  ancestors: ID[]
  indent: number
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
  afterAddNodes = createSignal<ID[]>()
  afterRemoveNodes = createSignal<ID[]>()
  afterReHierarchy = createSignal<ID>()
  afterSelect = createSignal()
  private nodeRuntimeCache = createCache2<ID, INodeRuntime>()
  initHook() {
    Pixi.inited.hook(() => {
      Pixi.duringTicker.hook({ id: 'flushDirty' }, this.flushDirty)
    })
    this.datumId.hook((id) => {
      const obb = StageElement.OBBCache.get(id)
      if (!obb) return (this.datumXY = XY.Of(0, 0))
      this.datumXY = XY.Of(obb.aabb.x, obb.aabb.y)
    })
    this.afterSelect.hook(() => {
      this.autoGetDatumId(this.selectIds.value)
      this.commitSelect()
      Schema.commitHistory('选择节点')
    })
    this.afterRemoveNodes.hook((ids) => {
      ids.forEach((id) => OperateNode.dirtyIds.delete(id))
      OperateNode.selectIds.dispatch((ids) => ids.clear())
      OperateNode.hoverIds.dispatch((hoverIds) => ids.forEach((id) => hoverIds.delete(id)))
    })
    this.afterReHierarchy.hook({ id: 'resetNodeRuntime' }, (parentId) => {
      Schema.find<INodeParent>(parentId).childIds.forEach((childId) => {
        if (!this.getNodeRuntime(childId)) return
        const indent = (this.getNodeRuntime(parentId)?.indent ?? -1) + 1
        const ancestors = this.getNodeRuntime(parentId)?.ancestors ?? []
        this.setNodeRuntime(childId, { indent, ancestors: [...ancestors, parentId] })
      })
    })
    Schema.registerListener('selectIds', () => {
      this.selectIds.dispatch(new Set(Schema.client.selectIds))
    })
    Schema.registerListener('addNodes', ({ changeIds }) => {
      this.afterAddNodes.dispatch(changeIds)
    })
    Schema.registerListener('removeNodes', ({ changeIds }) => {
      this.afterRemoveNodes.dispatch(changeIds)
    })
    Schema.registerListener('reHierarchy', ({ changeIds }) => {
      this.afterReHierarchy.dispatch(changeIds[0])
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
    this.selectIds.value.add(id)
  }
  unSelect(id: ID) {
    if (!this.selectIds.value.has(id)) return
    this.selectIds.value.delete(id)
  }
  clearSelect() {
    this.selectIds.value = new Set()
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
    const changeIds = nodes.map(({ id }) => id)
    Schema.commitOperation('addNodes', changeIds, '添加节点', { inverseType: 'removeNodes' })
  }
  removeNodes(nodes: INode[]) {
    nodes.forEach(Schema.removeItem)
    const changeIds = nodes.map(({ id }) => id)
    Schema.commitOperation('removeNodes', changeIds, '移除节点', { inverseType: 'addNodes' })
  }
  insertAt(parent: INodeParent, node: INode, index?: number) {
    index ??= parent.childIds.length
    Schema.itemAdd(parent, ['childIds', index], node.id)
    Schema.itemReset(node, ['parentId'], parent.id)
    Schema.commitOperation('reHierarchy', [parent.id], '插入子节点')
  }
  splice(parent: INodeParent, node: INode) {
    const index = parent.childIds.indexOf(node.id)
    Schema.itemDelete(parent, ['childIds', index])
    Schema.itemReset(node, ['parentId'], '')
    Schema.commitOperation('reHierarchy', [parent.id], '移除子节点')
  }
  setNodeRuntime(id: ID, runtime: Partial<INodeRuntime>) {
    const prevRuntime = this.getNodeRuntime(id)
    this.nodeRuntimeCache.set(id, { ...prevRuntime, ...runtime })
  }
  getNodeRuntime(id: ID) {
    return this.nodeRuntimeCache.getSet(id, () => {
      return { expand: false, indent: 0, ancestors: [] }
    })
  }
  private commitSelect() {
    const selectIdArr = [...this.selectIds.value]
    Schema.itemReset(Schema.meta, ['clients', Schema.client.id, 'selectIds'], selectIdArr)
    Schema.commitOperation('selectIds', ['meta'], `选择节点`)
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
