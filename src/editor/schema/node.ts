import autobind from 'class-autobind-decorator'
import { cloneDeep } from 'lodash-es'
import { nanoid } from 'nanoid'
import { createSignal } from '~/shared/signal'
import { XY } from '~/shared/structure/xy'
import { firstOne, insertAt, lastOne } from '~/shared/utils/array'
import { iife } from '~/shared/utils/normal'
import { Diff, IOperateDiff, createNodeDiffPath } from '../diff'
import { Record } from '../record'
import { StageElement } from '../stage/element'
import { Pixi } from '../stage/pixi'
import { SchemaDefault } from './default'
import { SchemaPage } from './page'
import { Schema } from './schema'
import { ID, INode, INodeParent } from './type'
import { SchemaUtil } from './util'

@autobind
export class SchemaNodeService {
  inited = createSignal(false)
  nodeMap = <Record<string, Record<string, INode>>>{}
  datumId = createSignal('')
  datumXY = XY.Of(0, 0)
  copyIds = <string[]>[]
  dirtyIds = new Set<string>()
  hoverIds = createSignal(new Set<string>())
  selectIds = createSignal(new Set<string>())
  afterAddNode = createSignal<INode>()
  afterNodesAdded = createSignal<ID[]>()
  afterNodesRemoved = createSignal<ID[]>()
  afterDelete = createSignal<INode[]>()
  afterConnect = createSignal<{ parent: INodeParent; node: INode; index?: number }>()
  afterDisconnect = createSignal<{ node: INode }>()
  beforeFlushDirty = createSignal()
  duringFlushDirty = createSignal('')
  afterFlushDirty = createSignal()
  afterReName = createSignal({ id: '', name: '' })
  afterReHierarchy = createSignal<{ node: INode }>()
  initHook() {
    Pixi.inited.hook(() => {
      Pixi.duringTicker.hook({ id: 'flushDirty' }, this.flushDirty)
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
    SchemaPage.afterAdd.hook({ id: 'addToNodeMap' }, (page) => {
      this.nodeMap[page.id] = {}
    })
    SchemaPage.currentPage.hook(() => {
      this.clearSelect()
    })
  }
  get currentNodeMap() {
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
  addNode(node: INode) {
    this.currentNodeMap[node.id] = node
    Diff.setAddPatch(createNodeDiffPath(node.id), node)
    Diff.setInverseAddPatch(createNodeDiffPath(node.id))
  }
  addNodes(nodes: INode[]) {
    nodes.forEach(this.addNode)
    const addIds = nodes.map(({ id }) => id)
    this.afterNodesAdded.dispatch(addIds)
    const operateDiff = Diff.commitOperateDiff('add nodes')
    this.recordNodeChange(operateDiff, 'add', addIds)
  }
  removeNode(node: INode) {
    delete this.currentNodeMap[node.id]
    Diff.setRemovePatch(createNodeDiffPath(node.id))
    Diff.setInverseRemovePatch(createNodeDiffPath(node.id), node)
  }
  removeNodes(nodes: INode[]) {
    nodes.forEach(this.removeNode)
    const removeIds = nodes.map(({ id }) => id)
    this.afterNodesRemoved.dispatch(removeIds)
    const operateDiff = Diff.commitOperateDiff('remove nodes')
    this.recordNodeChange(operateDiff, 'remove', removeIds)
  }
  deleteNodes(nodes: INode[]) {
    nodes.forEach((node) => (node.DELETE = true))
    this.afterDelete.dispatch(nodes)
    this.recordDelete(nodes)
  }
  copyNodes() {
    this.copyIds = iife(() => {
      if (this.selectIds.value.size) return [...this.selectIds.value]
      if (this.hoverIds.value.size) return [lastOne(this.hoverIds.value)]
      return <string[]>[]
    })
  }
  pasteNodes() {
    const newNodes = <INode[]>[]
    const newSelectIds = new Set<string>()
    const clone = (node: INode) => {
      const newNode = cloneDeep(node)
      newNode.id = nanoid()
      newNode.name = SchemaDefault.createNodeName(
        node.type === 'vector' ? node.vectorType : node.type
      ).name
      if ('childIds' in newNode) newNode.childIds = []
      newNodes.push(newNode)
      return newNode
    }
    SchemaUtil.traverseCurrentPageIds(this.copyIds, (props) => {
      const { node, upLevelRef, depth } = props
      const newNode = clone(node)
      this.addNode(newNode)
      props.custom = { newNode }
      const parent = iife(() => {
        if (depth === 0) return SchemaUtil.find(node.parentId)
        return upLevelRef?.custom.newNode
      })
      SchemaNode.connectAt(parent, newNode)
      if (depth === 0) newSelectIds.add(newNode.id)
    })
    this.afterNodesAdded.dispatch(newNodes)
    this.selectIds.dispatch(newSelectIds)
  }
  addChildAt(parent: INodeParent, node: INode, index?: number) {
    index ??= parent.childIds.length - 1
    insertAt(parent.childIds, index, node.id)
    node.parentId = parent.id
    Diff.setReplacePatch(createNodeDiffPath(node.id))
    Diff.setInverseReplacePatch(createNodeDiffPath(node.id), node)
  }
  connectAt(parent: INodeParent, node: INode, index?: number) {
    if (index === undefined) parent.childIds.push(node.id)
    else insertAt(parent.childIds, index, node.id)
    node.parentId = parent.id
    this.afterConnect.dispatch({ parent, node, index })
    this.recordConnect(parent, node, index)
  }
  disconnect(parent: INodeParent, node: INode) {
    const index = parent.childIds.findIndex((i) => i === node.id)
    parent.childIds.splice(index, 1)
    Diff.setAddPatch(createNodeDiffPath(node.id), node)
    Diff.setInverseAddPatch(createNodeDiffPath(node.id))
    this.afterDisconnect.dispatch({ node })
    this.recordDisconnect(parent, node, index)
  }
  find(id: string) {
    return this.currentNodeMap[id]
  }
  hover(id: string) {
    if (this.hoverIds.value.has(id)) return
    this.hoverIds.dispatch((ids) => ids.add(id))
  }
  unHover(id: string) {
    if (!this.hoverIds.value.has(id)) return
    this.hoverIds.dispatch((ids) => ids.delete(id))
  }
  clearHover() {
    this.hoverIds.dispatch(new Set())
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
    if (Record.isInRedoUndo) return
    Record.push({
      description: '添加节点',
      detail: addNodes.map((node) => node.id),
      undo: () => this.deleteNodes(addNodes),
      redo: () => this.addNodes(addNodes),
    })
  }
  private recordDelete(deleteNodes: INode[]) {
    if (Record.isInRedoUndo) return
    Record.push({
      description: '删除节点',
      detail: deleteNodes.map((node) => node.id),
      undo: () => this.addNodes(deleteNodes),
      redo: () => this.deleteNodes(deleteNodes),
    })
  }
  private recordConnect(parent: INodeParent, node: INode, index?: number) {
    if (Record.isInRedoUndo) return
    Record.push({
      description: '关联父子结点',
      detail: { parent: parent.name || 'currentPage', node: node.name },
      undo: () => this.disconnect(parent, node),
      redo: () => this.connectAt(parent, node, index),
    })
  }
  private recordDisconnect(parent: INodeParent, node: INode, index?: number) {
    if (Record.isInRedoUndo) return
    Record.push({
      description: '取消关联父子结点',
      detail: { parent: parent.name || 'currentPage', node: node.name },
      undo: () => this.connectAt(parent, node, index),
      redo: () => this.disconnect(parent, node),
    })
  }
  private recordNodeChange(diff: IOperateDiff, changeType: 'add' | 'remove', changeIds: string[]) {
    const travel = (type: 'undo' | 'redo') => {
      const { diffs, inverseDiffs } = diff
      Schema.applyDiff(type === 'undo' ? inverseDiffs : diffs)
      const undoAdd = type === 'undo' && changeType === 'add'
      const redoAdd = type === 'redo' && changeType === 'add'
      const undoRemove = type === 'undo' && changeType === 'remove'
      const redoRemove = type === 'redo' && changeType === 'remove'
      if (undoAdd || redoRemove) this.afterNodesRemoved.dispatch(changeIds)
      if (undoRemove || redoAdd) this.afterNodesAdded.dispatch(changeIds)
    }
    Record.push({
      description: changeType === 'add' ? '增加节点' : '移除节点',
      detail: { changeType, changeIds },
      undo: () => travel('undo'),
      redo: () => travel('redo'),
    })
  }
}

export const SchemaNode = new SchemaNodeService()
