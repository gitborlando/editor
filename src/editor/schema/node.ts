import { makeObservable, observable, when } from 'mobx'
import { delay, inject, injectable } from 'tsyringe'
import { autobind } from '~/shared/decorator'
import { createHooker } from '~/shared/hooker'
import { Delete } from '~/shared/utils'
import { PixiService, injectPixi } from '../stage/pixi'
import { SchemaPageService } from './page'
import { INode } from './type'

@autobind
@injectable()
export class SchemaNodeService {
  @observable initialized = false
  @observable hoverId = ''
  @observable selectIds = new Set<string>()
  dirtyIds = new Set<string>()
  nodeMap = <Record<string, INode>>{}
  beforeFlushDirty = createHooker()
  duringFlushDirty = createHooker<[string]>()
  afterFlushDirty = createHooker()
  beforeDelete = createHooker<[string]>()
  constructor(
    @injectPixi private Pixi: PixiService,
    @inject(delay(() => SchemaPageService)) private SchemaPage: SchemaPageService
  ) {
    makeObservable(this)
    when(() => Pixi.initialized && this.initialized).then(() => {
      this.Pixi.app.ticker.add(this.flushDirty)
    })
  }
  get selectNodes() {
    const nodes = <INode[]>[]
    this.selectIds.forEach((id) => nodes.push(this.find(id)))
    return nodes
  }
  setMap(map: typeof this.nodeMap) {
    this.nodeMap = map
    this.initialized = true
  }
  add(node: INode) {
    this.nodeMap[node.id] = node
    this.collectDirty(node.id)
    return node
  }
  delete(id: string) {
    this.beforeDelete.dispatch(id)
    Delete(this.nodeMap, id)
    const node = this.find(id)
    if ('childIds' in node) node.childIds.forEach((i) => this.delete(i))
    // const parent = this.find(node.parentId) as INodeParent
    // Delete(parent.childIds, (id) => id === node.id)
  }
  find(id: string) {
    return this.nodeMap[id]
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
  unHover() {
    this.hoverId = ''
  }
  select(id: string) {
    if (this.selectIds.has(id)) return
    this.selectIds.add(id)
  }
  unSelect(id: string) {
    if (!this.selectIds.has(id)) return
    this.selectIds.delete(id)
  }
  clearSelection() {
    this.selectIds.forEach(this.collectDirty)
    this.selectIds = new Set()
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
    this.selectIds.forEach(this.collectDirty)
  }
}

export const injectSchemaNode = inject(SchemaNodeService)
