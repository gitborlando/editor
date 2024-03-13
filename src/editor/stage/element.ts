import autobind from 'class-autobind-decorator'
import { Cache, createCache } from '~/shared/cache'
import { batchSignal } from '~/shared/signal'
import { XY } from '~/shared/structure/xy'
import { OBB } from '../math/obb'
import { Path } from '../math/path/path'
import { SchemaNode } from '../schema/node'
import { SchemaPage } from '../schema/page'
import { INode } from '../schema/type'
import { SchemaUtil } from '../schema/util'
import { StageDraw } from './draw/draw'
import { PIXI, Pixi } from './pixi'
import { StageViewport } from './viewport'

export type IStageElement = PIXI.Graphics | PIXI.Text

@autobind
export class StageElementService {
  canHover = true
  containerCache = createCache<PIXI.Container>()
  OBBCache = createCache<OBB>()
  pathCache = createCache<Path>()
  outlineCache = createCache<PIXI.Graphics>()
  frameNameCache = createCache<PIXI.Text>()
  linearGradientCache = createCache<PIXI.Texture>()
  private pagesElementMap = createCache<Cache<string, IStageElement>>()
  private elementsContainer = new PIXI.Container()
  private get elementMap() {
    return this.pagesElementMap.getSet(SchemaPage.currentId.value, () => createCache())
  }
  initHook() {
    Pixi.inited.hook(() => {
      this.bindHover()
      this.elementsContainer.setParent(Pixi.sceneStage)
    })
    SchemaNode.afterAdd.hook((nodes) => {
      nodes.forEach((node) => this.add(node))
    })
    SchemaNode.afterDelete.hook((nodes) => {
      nodes.forEach((node) => this.delete(node.id))
    })
  }
  add(node: INode) {
    const { id, parentId, type } = node
    const element = type === 'text' ? new PIXI.Text() : new PIXI.Graphics()
    this.elementMap.set(id, element)
    if (SchemaUtil.isContainerNode(node) && !this.containerCache.get(id)) {
      const container = new PIXI.Container()
      container.setParent(this.elementsContainer)
      this.containerCache.set(id, container)
    }
    const selfContainer = this.containerCache.get(id)
    const parentContainer = this.containerCache.get(parentId)
    element.setParent(selfContainer || parentContainer || this.elementsContainer)
    this.initOBB(id)
    this.initOutline(id)
    StageDraw.collectRedraw(id)
  }
  delete(id: string) {
    this.elementMap.get(id)?.destroy()
    this.elementMap.delete(id)
    this.OBBCache.delete(id)
    this.pathCache.delete(id)
    this.outlineCache.get(id).destroy()
    this.outlineCache.delete(id)
    this.frameNameCache.get(id)?.destroy()
    this.frameNameCache.delete(id)
  }
  find(id: string) {
    return this.elementMap.get(id)
  }
  clearAll() {
    this.elementMap.clear()
    this.OBBCache.clear()
    this.pathCache.clear()
    this.outlineCache.clear()
    this.containerCache.clear()
    this.elementsContainer.removeChildren()
  }
  findOrCreate<T extends IStageElement = PIXI.Graphics>(node: INode): T {
    const { id } = node
    const element = this.find(id)
    if (element) return element as T
    this.add(node)
    return this.find(id) as T
  }
  private bindHover() {
    const handler = batchSignal([SchemaNode.hoverIds], (e: Event) => {
      if (!this.canHover) return
      const realXY = StageViewport.toViewportXY(XY.From(e, 'client'))
      this.elementMap.forEach((id, element) => {
        const hovered = element?.containsPoint(realXY)
        hovered ? SchemaNode.hover(id) : SchemaNode.unHover(id)
      })
    })
    Pixi.addListener('mousemove', handler, { capture: true })
  }
  private initOBB(id: string) {
    const { centerX, centerY, width, height, rotation } = SchemaNode.find(id)
    const obb = new OBB(centerX, centerY, width, height, rotation)
    this.OBBCache.set(id, obb)
  }
  private initOutline(id: string) {
    this.outlineCache.set(id, new PIXI.Graphics())
  }
}

export const StageElement = new StageElementService()
