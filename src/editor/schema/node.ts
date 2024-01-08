import { computed } from 'mobx'
import { autobind } from '~/shared/decorator'
import { createSignal } from '~/shared/signal'
import { insertAt } from '~/shared/utils/array'
import { Delete } from '~/shared/utils/normal'
import { StageDraw } from '../stage/draw/draw'
import { StageElement } from '../stage/element'
import { Pixi } from '../stage/pixi'
import { SchemaPage } from './page'
import { INode, INodeParent, IPage } from './type'
import { SchemaUtil } from './util'

@autobind
export class SchemaNodeService {
  inited = createSignal(false)
  nodeMap = <Record<string, Record<string, INode>>>{}
  dirtyIds = new Set<string>()
  hoverIds = createSignal(new Set<string>())
  selectIds = createSignal(new Set<string>())
  afterAdd = createSignal('')
  afterConnect = createSignal({ id: '', parentId: '' })
  beforeDelete = createSignal({ id: '', parentId: '' })
  beforeFlushDirty = createSignal()
  duringFlushDirty = createSignal('')
  afterFlushDirty = createSignal()
  datumId = createSignal('')
  initHook() {
    SchemaPage.currentId.hook(() => {
      StageElement.clearAll()
      const nodeIds = SchemaPage.find(SchemaPage.currentId.value)!.childIds
      nodeIds.forEach(SchemaNode.collectDirty)
    })
    this.duringFlushDirty.hook((id) => {
      const node = SchemaNode.find(id)
      StageDraw.drawNode(node)
      if ('childIds' in node && SchemaPage.isPageFirstRendered.value === false) {
        node.childIds.forEach(SchemaNode.collectDirty)
      }
    })
    Pixi.inited.hook(() => {
      Pixi.duringTicker.hook(this.flushDirty)
    })
  }
  @computed get currentPageNodeMap() {
    return this.nodeMap[SchemaPage.currentId.value]
  }
  @computed get selectNodes() {
    const nodes = <INode[]>[]
    this.selectIds.value.forEach((id) => nodes.push(this.find(id)))
    return nodes
  }
  setMap(map: typeof this.nodeMap) {
    this.nodeMap = map
  }
  add(node: INode) {
    this.currentPageNodeMap[node.id] = node
    this.collectDirty(node.id)
    this.afterAdd.dispatch(node.id)
    return node
  }
  delete(id: string) {
    const node = this.find(id)
    this.beforeDelete.dispatch({ id, parentId: node.parentId })
    if ('childIds' in node) node.childIds.forEach((i) => this.delete(i))
    Delete(SchemaUtil.getChildIds(node.parentId), node.id)
    Delete(this.currentPageNodeMap, id)
  }
  find(id: string) {
    return this.currentPageNodeMap[id]
  }
  connectAt(parent: INodeParent | IPage, node: INode, index?: number) {
    if (index !== undefined && !(index < 0 || index > parent.childIds.length - 1)) {
      insertAt(parent.childIds, index, node.id)
    } else parent.childIds.push(node.id)
    node.parentId = parent.id
    this.afterConnect.dispatch({ id: node.id, parentId: parent.id })
  }
  disconnect(parent: INodeParent | IPage, node: INode) {
    Delete(parent.childIds, node.id)
  }
  hover(id: string) {
    this.hoverIds.value.add(id)
  }
  unHover(id: string) {
    this.hoverIds.value.delete(id)
  }
  select(id: string) {
    if (this.selectIds.value.has(id)) return
    this.selectIds.value.add(id)
    this.selectIds.dispatch()
  }
  unSelect(id: string) {
    if (!this.selectIds.value.has(id)) return
    this.selectIds.value.delete(id)
    this.selectIds.dispatch()
  }
  clearSelect() {
    this.selectIds.value.forEach(this.collectDirty)
    this.selectIds.dispatch(new Set())
  }
  collectDirty(id: string) {
    this.dirtyIds.add(id)
  }
  flushDirty() {
    this.beforeFlushDirty.dispatch()
    this.dirtyIds.forEach((id) => {
      this.duringFlushDirty.dispatch(id)
      this.dirtyIds.delete(id)
    })
    this.afterFlushDirty.dispatch()
  }
  makeSelectDirty() {
    this.selectIds.value.forEach(this.collectDirty)
  }
}

export const SchemaNode = new SchemaNodeService()
