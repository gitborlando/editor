import { makeObservable, observable, when } from 'mobx'
import { delay, inject, injectable } from 'tsyringe'
import { WatchNext, autobind } from '~/shared/decorator'
import { createHooker } from '~/shared/hooker/hooker'
import { Delete } from '~/shared/utils'
import { OptimizeCache } from '../../shared/cache'
import { OBB } from '../math/obb'
import { PixiService, injectPixi } from '../stage/pixi'
import { SchemaPageService } from './page'
import { INode } from './type'

@autobind
@injectable()
export class SchemaNodeService {
  @observable initialized = false
  @observable hoverId = ''
  @observable selectCount = 0
  selectIds = new Set<string>()
  dirtyIds = new Set<string>()
  nodeMap = <Record<string, INode>>{}
  whenSelectChange = createHooker()
  beforeFlushDirty = createHooker()
  duringFlushDirty = createHooker<[string]>()
  afterFlushDirty = createHooker()
  OBBCache = OptimizeCache.GetOrNew<OBB>('OBB')
  constructor(
    @injectPixi private Pixi: PixiService,
    @inject(delay(() => SchemaPageService)) private SchemaPage: SchemaPageService
  ) {
    makeObservable(this)
    this.Pixi.afterInitialize.hook(() => {
      when(() => this.initialized).then(() => {
        this.Pixi.app.ticker.add(this.flushDirty)
        this.autoDispatchSelectChange()
      })
    }, 0)
  }
  setMap(map: typeof this.nodeMap) {
    this.nodeMap = map
    Object.keys(this.nodeMap).forEach(this.initOBB)
    this.initialized = true
  }
  add(node: INode) {
    this.nodeMap[node.id] = node
    this.initOBB(node.id)
    return node
  }
  delete(id: string) {
    const node = this.find(id)
    Delete(this.nodeMap, node.id)
    if ('childIds' in node) node.childIds.forEach((i) => this.delete(i))
    // const parent = this.find(node.parentId) as INodeParent
    // Delete(parent.childIds, (id) => id === node.id)
    this.OBBCache.delete(id)
    OptimizeCache.GetOrNew('draw-path').delete(id)
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
    this.selectCount--
  }
  unSelect(id: string) {
    if (!this.selectIds.has(id)) return
    this.selectIds.delete(id)
    this.selectCount++
  }
  clearSelection() {
    this.selectIds.forEach(this.collectDirty)
    this.selectIds = new Set()
    this.selectCount = 0
  }
  @WatchNext('selectCount')
  private autoDispatchSelectChange() {
    this.whenSelectChange.dispatch()
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
  private initOBB(id: string) {
    const { centerX, centerY, width, height, rotation, scaleX, scaleY } = this.find(id)
    const obb = new OBB(centerX, centerY, width, height, rotation, scaleX, scaleY)
    this.OBBCache.set(id, obb)
  }
}

export const injectSchemaNode = inject(SchemaNodeService)
