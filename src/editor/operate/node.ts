import autobind from 'class-autobind-decorator'
import { cloneDeep } from 'lodash-es'
import { nanoid } from 'nanoid'
import { createSignal } from '~/shared/signal/signal'
import { firstOne, stableIndex } from '~/shared/utils/array'
import { createObjCache } from '~/shared/utils/cache'
import { SchemaUtil } from '~/shared/utils/schema'
import { OBB } from '../math/obb'
import { xy_, xy_rotate } from '../math/xy'
import { SchemaDefault } from '../schema/default'
import { SchemaHistory } from '../schema/history'
import { Schema } from '../schema/schema'
import { ID, INode, INodeParent } from '../schema/type'
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
  datumXY = xy_(0, 0)
  hoverIds = createSignal(new Set<ID>())
  selectIds = createSignal(new Set<ID>())
  afterRemoveNodes = createSignal<ID[]>()
  selectedNodes = createSignal(<INode[]>[])
  intoEditNodeId = createSignal('')
  selectedNodes$ = createSignal(<INode[]>[])
  private lastSelectedNodeSet = new Set<INode>()
  private nodeRuntimeCache = createObjCache<INodeRuntime>()
  private copyIds = <ID[]>[]
  initHook() {
    this.afterRemoveNodes.hook((ids) => {
      this.selectIds.dispatch((ids) => ids.clear())
      this.hoverIds.dispatch((hoverIds) => ids.forEach((id) => hoverIds.delete(id)))
    })
    Schema.onMatchPatch('/client/selectIds', () => {
      this.selectIds.value = new Set(Schema.client.selectIds)
      this.selectedNodes$.dispatch(Schema.client.selectIds.map(Schema.find<INode>))
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
    this.intoEditNodeId.intercept((id) => {
      if (!id) return ''
      const node = Schema.find(id)
      if (node.type === 'vector' && node.vectorType === 'irregular') return id
      return ''
    })
    this.intoEditNodeId.hook((id) => {
      Pixi.isForbidEvent = !!id
    })
  }
  get selectingNodes() {
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
    Schema.itemReset(Schema.client, ['selectIds'], selectIdArr)
    Schema.commitOperation(`选择节点`)
  }
  commitFinalSelect() {
    this.commitSelect()
    Schema.nextSchema()
    SchemaHistory.commit('选择节点')
  }
  addNodes(nodes: INode[]) {
    nodes.forEach(Schema.addItem)
    Schema.commitOperation('添加节点')
  }
  removeNodes(nodes: INode[]) {
    nodes.forEach(Schema.removeItem)
    Schema.commitOperation('移除节点')
    this.afterRemoveNodes.dispatch(nodes.map((node) => node.id))
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
  reHierarchy(parent: INodeParent, node: INode, index: number) {
    index = stableIndex(parent.childIds, index)
    const oldIndex = parent.childIds.indexOf(node.id)
    Schema.itemDelete(parent, ['childIds', oldIndex])
    Schema.itemAdd(parent, ['childIds', index], node.id)
    Schema.commitOperation('重新排序')
  }
  deleteSelectNodes() {
    const ids = [...this.selectIds.value]
    const nodes = <INode[]>[]
    this.clearSelect()
    this.commitSelect()
    SchemaUtil.traverseIds(ids, ({ node, parent }) => {
      nodes.push(node)
      this.splice(parent, node)
    })
    this.removeNodes(nodes)
    Schema.finalOperation('删除节点')
  }
  copySelectNodes() {
    this.copyIds = [...this.selectIds.value]
  }
  pasteNodes() {
    if (!this.copyIds.length) return
    const newSelectIds = <ID[]>[]
    const clone = (oldNode: INode) => {
      const newNode = cloneDeep(oldNode)
      newNode.id = nanoid()
      const type = oldNode.type === 'vector' ? oldNode.vectorType : oldNode.type
      newNode.name = SchemaDefault.createNodeName(type).name
      if ('childIds' in newNode) newNode.childIds = []
      return newNode
    }
    SchemaUtil.traverseIds(this.copyIds, (props) => {
      const { node, parent, depth, upLevelRef } = props
      const newNode = clone(node)
      const newParent = upLevelRef?.newNode || parent
      const index = newParent.childIds.indexOf(node.id)
      this.addNodes([newNode])
      this.insertAt(newParent, newNode, index + 1)
      props.newNode = newNode
      if (depth === 0) newSelectIds.push(newNode.id)
    })
    this.selectIds.dispatch(new Set(newSelectIds))
    this.commitSelect()
    Schema.commitOperation('粘贴节点')
  }
  paste() {
    this.pasteNodes()
    this.copyIds = []
    Schema.nextSchema()
    Schema.commitHistory('粘贴节点')
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
  getNodeCenterXY(node: INode) {
    const center = xy_(node.x + node.width / 2, node.y + node.height / 2)
    return xy_rotate(center, xy_(node.x, node.y), node.rotation)
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
    const { obb } = this.getNodeRuntime(this.datumId.value)
    if (!obb) return (this.datumXY = xy_(0, 0))
    this.datumXY = xy_(obb.aabb.x, obb.aabb.y)
  }
}

export const OperateNode = new OperateNodeService()
