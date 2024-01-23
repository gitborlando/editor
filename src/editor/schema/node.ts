import autobind from 'class-autobind-decorator'
import { createSignal } from '~/shared/signal'
import { XY } from '~/shared/structure/xy'
import { firstOne, insertAt } from '~/shared/utils/array'
import { Record, recordSignalContext } from '../record'
import { StageElement } from '../stage/element'
import { Pixi } from '../stage/pixi'
import { SchemaPage } from './page'
import { INode, INodeParent, IPage } from './type'
import { SchemaUtil } from './util'

@autobind
export class SchemaNodeService {
  inited = createSignal(false)
  nodeMap = <Record<string, Record<string, INode>>>{}
  datumId = createSignal('')
  datumXY = XY.Of(0, 0)
  dirtyIds = new Set<string>()
  hoverIds = createSignal(new Set<string>())
  selectIds = createSignal(new Set<string>())
  afterAdd = createSignal<INode[]>()
  afterDelete = createSignal<INode[]>()
  afterConnect = createSignal<{ parent: INodeParent; node: INode; index?: number }>()
  afterDisconnect = createSignal<{ node: INode }>()
  beforeFlushDirty = createSignal()
  duringFlushDirty = createSignal('')
  afterFlushDirty = createSignal()
  afterReName = createSignal({ id: '', name: '' })
  initHook() {
    Pixi.inited.hook(() => {
      Pixi.duringTicker.hook(this.flushDirty, ['id:flushDirty'])
    })
    this.selectIds.hook((selectIds) => {
      this.autoGetDatumId(selectIds)
    })
    this.afterDelete.hook((nodes) => {
      nodes.forEach(({ id }) => this.dirtyIds.delete(id))
      this.selectIds.dispatch((ids) => ids.clear())
      this.hoverIds.dispatch((ids) => nodes.forEach(({ id }) => ids.delete(id)))
    })
    this.datumId.hook((id) => {
      if (id === '' || SchemaUtil.isPage(id)) {
        this.datumXY = XY.Of(0, 0)
      } else {
        const OBB = StageElement.OBBCache.get(this.datumId.value)
        this.datumXY = XY.Of(OBB.aabb.x, OBB.aabb.y)
      }
    })
  }
  get currentPageNodeMap() {
    return this.nodeMap[SchemaPage.currentId.value]
  }
  get selectNodes() {
    const nodes = <INode[]>[]
    this.selectIds.value.forEach((id) => nodes.push(this.find(id)))
    return nodes
  }
  setMap(map: typeof this.nodeMap) {
    this.nodeMap = map
  }
  addNodes(nodes: INode[]) {
    nodes.forEach((node) => {
      delete node.DELETE
      this.currentPageNodeMap[node.id] = node
    })
    this.afterAdd.dispatch(nodes)
    this.recordAddNode(nodes)
  }
  deleteNodes(nodes: INode[]) {
    nodes.forEach((node) => (node.DELETE = true))
    this.afterDelete.dispatch(nodes)
    this.recordDelete(nodes)
  }
  connectAt(parent: INodeParent | IPage, node: INode, index?: number) {
    if (index !== undefined && !(index < 0 || index > parent.childIds.length - 1)) {
      insertAt(parent.childIds, index, node.id)
    } else parent.childIds.push(node.id)
    node.parentId = parent.id
    this.afterConnect.dispatch({ parent, node, index })
    this.recordConnect(parent, node, index)
  }
  disconnect(parent: INodeParent | IPage, node: INode) {
    const index = parent.childIds.findIndex((i) => i === node.id)
    parent.childIds.splice(index, 1)
    this.afterDisconnect.dispatch({ node })
    this.recordDisconnect(parent, node, index)
  }
  find(id: string) {
    return this.currentPageNodeMap[id]
  }
  hover(id: string) {
    this.hoverIds.dispatch((ids) => ids.add(id))
  }
  unHover(id: string) {
    this.hoverIds.dispatch((ids) => ids.delete(id))
  }
  select(id: string) {
    if (this.selectIds.value.has(id)) return
    this.selectIds.dispatch((ids) => ids.add(id))
  }
  unSelect(id: string) {
    if (!this.selectIds.value.has(id)) return
    this.selectIds.dispatch((ids) => ids.delete(id))
  }
  clearSelect() {
    this.selectIds.dispatch(new Set())
  }
  collectDirty(id: string) {
    this.dirtyIds.add(id)
  }
  flushDirty() {
    this.beforeFlushDirty.dispatch()
    this.dirtyIds.forEach(this.duringFlushDirty.dispatch)
    this.dirtyIds.clear()
    this.afterFlushDirty.dispatch()
  }
  makeSelectDirty() {
    this.selectIds.value.forEach(this.collectDirty)
  }
  private autoGetDatumId(selectIds: Set<string>) {
    if (selectIds.size === 0) {
      this.datumId.dispatch('')
    }
    if (selectIds.size === 1) {
      this.datumId.dispatch(this.find(firstOne(selectIds)).parentId)
    }
    if (selectIds.size > 1) {
      const parentIds = new Set<string>()
      selectIds.forEach((id) => parentIds.add(this.find(id).parentId))
      if (parentIds.size === 1) this.datumId.dispatch(firstOne(parentIds))
      if (parentIds.size > 1) this.datumId.dispatch('')
    }
  }
  private recordAddNode(addNodes: INode[]) {
    if (recordSignalContext()) return
    Record.push({
      description: '添加节点',
      detail: addNodes.map((node) => node.id),
      undo: () => this.deleteNodes(addNodes),
      redo: () => this.addNodes(addNodes),
    })
  }
  private recordDelete(deleteNodes: INode[]) {
    if (recordSignalContext()) return
    Record.push({
      description: '删除节点',
      detail: deleteNodes.map((node) => node.id),
      undo: () => this.addNodes(deleteNodes),
      redo: () => this.deleteNodes(deleteNodes),
    })
  }
  private recordConnect(parent: INodeParent, node: INode, index?: number) {
    if (recordSignalContext()) return
    Record.push({
      description: '关联父子结点',
      detail: { parent: parent.name || 'currentPage', node: node.name },
      undo: () => this.disconnect(parent, node),
      redo: () => this.connectAt(parent, node, index),
    })
  }
  private recordDisconnect(parent: INodeParent, node: INode, index?: number) {
    if (recordSignalContext()) return
    Record.push({
      description: '取消关联父子结点',
      detail: { parent: parent.name || 'currentPage', node: node.name },
      undo: () => this.connectAt(parent, node, index),
      redo: () => this.disconnect(parent, node),
    })
  }
}

export const SchemaNode = new SchemaNodeService()
