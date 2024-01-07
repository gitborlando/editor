import { computed, makeObservable, observable, when } from 'mobx'
import { delay, inject, injectable } from 'tsyringe'
import { autobind } from '~/shared/decorator'
import { createHooker } from '~/shared/hooker'
import { createSignal } from '~/shared/signal'
import { Delete, insertAt } from '~/shared/utils/normal'
import { PixiService, injectPixi } from '../stage/pixi'
import { SchemaPageService } from './page'
import { INode, INodeParent, IPage } from './type'
import { SchemaUtilService, injectSchemaUtil } from './util'

@autobind
@injectable()
export class SchemaNodeService {
  @observable initialized = false
  nodeMap = <Record<string, Record<string, INode>>>{}
  dirtyIds = new Set<string>()
  hoverIds = createSignal(new Set<string>())
  selectIds = createSignal(new Set<string>())
  inited = createHooker()
  afterAdd = createSignal('')
  afterConnect = createSignal({ id: '', parentId: '' })
  beforeDelete = createHooker<[string, string]>()
  beforeFlushDirty = createHooker()
  duringFlushDirty = createHooker<[string]>()
  afterFlushDirty = createHooker()
  datumId = createSignal('')
  constructor(
    @injectPixi private Pixi: PixiService,
    @inject(delay(() => SchemaPageService)) private SchemaPage: SchemaPageService,
    @injectSchemaUtil private SchemaUtil: SchemaUtilService
  ) {
    makeObservable(this)
    when(() => Pixi.initialized && this.initialized).then(() => {
      this.Pixi.duringTicker.hook(this.flushDirty)
    })
    // this.inited.hook(() => {
    //   this.selectIds.intercept((selectIds) => {
    //     if (selectIds.size === 0) this.datumId.dispatch(SchemaPage.currentId)
    //     else {
    //       selectIds.forEach((id) => {
    //         const node = this.find(id)
    //         if (SchemaUtil.isPage(node.parentId) && SchemaUtil.isFrame(id)) {
    //           this.datumId.dispatch(id)
    //         }
    //       })
    //     }
    //   })
    // })
  }
  @computed get currentPageNodeMap() {
    return this.nodeMap[this.SchemaPage.currentId]
  }
  @computed get selectNodes() {
    const nodes = <INode[]>[]
    this.selectIds.value.forEach((id) => nodes.push(this.find(id)))
    return nodes
  }
  setMap(map: typeof this.nodeMap) {
    this.nodeMap = map
    this.initialized = true
    this.inited.dispatch()
  }
  add(node: INode) {
    this.currentPageNodeMap[node.id] = node
    this.collectDirty(node.id)
    this.afterAdd.dispatch(node.id)
    return node
  }
  delete(id: string) {
    const node = this.find(id)
    this.beforeDelete.dispatch(id, node.parentId)
    if ('childIds' in node) node.childIds.forEach((i) => this.delete(i))
    Delete(this.SchemaUtil.getChildIds(node.parentId), node.id)
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

export const injectSchemaNode = inject(SchemaNodeService)
