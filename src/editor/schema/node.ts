import { autobind } from '~/shared/decorator'
import { createSignal } from '~/shared/signal'
import { firstOne, insertAt } from '~/shared/utils/array'
import { Delete } from '~/shared/utils/normal'
import { Pixi } from '../stage/pixi'
import { SchemaPage } from './page'
import { INode, INodeParent, IPage } from './type'
import { SchemaUtil } from './util'

@autobind
export class SchemaNodeService {
  inited = createSignal(false)
  nodeMap = <Record<string, Record<string, INode>>>{}
  datumId = createSignal('')
  dirtyIds = new Set<string>()
  redrawIds = new Set<string>()
  hoverIds = createSignal(new Set<string>())
  selectIds = createSignal(new Set<string>())
  afterAdd = createSignal<INode>()
  afterConnect = createSignal({ id: '', parentId: '' })
  beforeDelete = createSignal({ id: '', parentId: '' })
  beforeFlushDirty = createSignal()
  duringFlushDirty = createSignal('')
  afterFlushDirty = createSignal()
  initHook() {
    Pixi.inited.hook(() => {
      Pixi.duringTicker.hook(this.flushDirty)
    })
    this.selectIds.hook((selectIds) => {
      this.autoGetDatumId(selectIds)
    })
    this.afterAdd.hook((node) => {
      this.connectAt(SchemaPage.currentPage.value, node)
      this.collectDirty(node.id)
      this.clearSelect()
      this.select(node.id)
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
  add(node: INode) {
    this.currentPageNodeMap[node.id] = node
    this.afterAdd.dispatch(node)
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
    this.dirtyIds.forEach(this.duringFlushDirty.dispatch)
    this.dirtyIds.clear()
    this.afterFlushDirty.dispatch()
  }
  makeSelectDirty() {
    this.selectIds.value.forEach(this.collectDirty)
  }
  collectRedraw(id: string) {
    this.redrawIds.add(id)
  }
  private autoGetDatumId(selectIds: Set<string>) {
    if (selectIds.size === 0) return
    if (selectIds.size === 1) {
      this.datumId.dispatch(this.find(firstOne(selectIds)).parentId)
    }
    if (selectIds.size > 1) {
      const parentIds = new Set<string>()
      selectIds.forEach((id) => parentIds.add(this.find(id).parentId))
      if (parentIds.size === 1) this.datumId.dispatch(firstOne(parentIds))
      if (parentIds.size > 1) this.datumId.dispatch(SchemaPage.currentId.value)
    }
  }
}

export const SchemaNode = new SchemaNodeService()
