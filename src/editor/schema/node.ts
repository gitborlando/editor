import autobind from 'class-autobind-decorator'
import { createSignal } from '~/shared/signal'
import { XY } from '~/shared/structure/xy'
import { firstOne, insertAt } from '~/shared/utils/array'
import { Delete } from '~/shared/utils/normal'
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
  afterConnect = createSignal({ id: '', parentId: '' })
  beforeDelete = createSignal({ id: '', parentId: '' })
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
  add(node: INode) {
    this.currentPageNodeMap[node.id] = node
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
}

export const SchemaNode = new SchemaNodeService()
