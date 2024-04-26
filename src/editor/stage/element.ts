import autobind from 'class-autobind-decorator'
import { createCache2 } from '~/shared/cache'
import { flushList } from '~/shared/utils/list'
import { max } from '../math/base'
import { OBB } from '../math/obb'
import { Path } from '../math/path/path'
import { OperateNode } from '../operate/node'
import { Schema } from '../schema/schema'
import { ID, IFill, INode, INodeParent } from '../schema/type'
import { SchemaUtil } from '../schema/util'
import { StageDraw } from './draw/draw'
import { PIXI, Pixi } from './pixi'
import { StageViewport } from './viewport'

export type IStageElement = PIXI.Graphics | PIXI.Text

@autobind
export class StageElementService {
  OBBCache = createCache2<ID, OBB>()
  pathCache = createCache2<ID, Path>()
  outlineCache = createCache2<ID, PIXI.Graphics>()
  hitAreaCache = createCache2<ID, (x: number, y: number) => boolean>()
  frameNameCache = createCache2<ID, PIXI.Text>()
  linearGradientCache = createCache2<IFill, PIXI.Texture>()
  maskCache = createCache2<ID, PIXI.Graphics>()
  private elementCache = createCache2<ID, IStageElement>()
  private containerCache = createCache2<ID, PIXI.Container>()
  private mainContainer = new PIXI.Container()
  private reHierarchyIds = new Set<ID>()
  initHook() {
    OperateNode.afterFlushDirty.hook({ id: 'reHierarchy' }, () => {
      this.reHierarchy()
    })
    Pixi.inited.hook(() => {
      this.mainContainer.setParent(Pixi.sceneStage)
    })
    OperateNode.afterAddNodes.hook((ids) => {
      ids.forEach((id) => this.create(Schema.find<INode>(id)))
    })
    OperateNode.afterRemoveNodes.hook((ids) => {
      ids.forEach((id) => this.delete(id))
    })
    OperateNode.afterReHierarchy.hook((parentId) => {
      this.collectReHierarchy(parentId)
      this.reHierarchy()
    })
  }
  create(node: INode) {
    const { id, type } = node
    const element = type === 'text' ? new PIXI.Text() : new PIXI.Graphics()
    this.elementCache.set(id, element)
    this.setupOBB(id)
    this.initOutline(id)
    this.initTextResolution(node, element as PIXI.Text)
    return element
  }
  delete(id: string) {
    this.elementCache.get(id)?.destroy()
    this.elementCache.delete(id)
    this.containerCache.get(id)?.destroy()
    this.containerCache.delete(id)
    this.maskCache.get(id)?.destroy()
    this.maskCache.delete(id)
    this.OBBCache.delete(id)
    this.pathCache.delete(id)
    this.outlineCache.get(id).destroy()
    this.outlineCache.delete(id)
    this.frameNameCache.get(id)?.destroy()
    this.frameNameCache.delete(id)
  }
  findElement(id: string) {
    return this.elementCache.getSet(id, () => {
      return this.create(Schema.find(id))
    })
  }
  findContainer(id: string) {
    if (SchemaUtil.isById(id, 'page')) return this.mainContainer
    return this.containerCache.getSet(id, () => {
      const container = new PIXI.Container()
      const mask = new PIXI.Graphics()
      const element = this.findElement(id)
      this.containerCache.set(id, container)
      this.maskCache.set(id, mask)
      container.mask = mask
      element.setParent(container)
      mask.setParent(container)
      return container
    })
  }
  clearAll() {
    this.elementCache.clear()
    this.containerCache.clear()
    this.maskCache.clear()
    this.OBBCache.clear()
    this.pathCache.clear()
    this.outlineCache.clear()
    this.mainContainer.removeChildren()
  }
  collectReHierarchy(id: ID) {
    this.reHierarchyIds.add(id)
  }
  private reHierarchy() {
    flushList(this.reHierarchyIds, (id) => {
      const nodeParent = Schema.find<INodeParent>(id)
      const nodeParentContainer = this.findContainer(id)
      nodeParent.childIds.forEach((childId) => {
        const element = this.findElement(childId)
        if (SchemaUtil.isById(childId, 'nodeParent')) {
          const selfContainer = this.findContainer(childId)
          selfContainer.setParent(nodeParentContainer)
        } else {
          element.setParent(nodeParentContainer)
        }
      })
    })
  }
  setupOBB(id: string) {
    const { centerX, centerY, width, height, rotation } = Schema.find<INode>(id)
    const obb = new OBB(centerX, centerY, width, height, rotation)
    this.OBBCache.set(id, obb)
  }
  private initOutline(id: string) {
    this.outlineCache.set(id, new PIXI.Graphics())
  }
  private initTextResolution(node: INode, text: PIXI.Text) {
    if (node.type !== 'text') return
    StageViewport.zoom.hook((zoom) => {
      text.resolution = max(zoom, 1)
      StageDraw.collectRedraw(node.id)
    })
  }
}

export const StageElement = new StageElementService()
