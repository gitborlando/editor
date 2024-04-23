import autobind from 'class-autobind-decorator'
import { Cache, createCache } from '~/shared/cache'
import { batchSignal } from '~/shared/signal'
import { XY } from '~/shared/structure/xy'
import { max } from '../math/base'
import { OBB } from '../math/obb'
import { Path } from '../math/path/path'
import { SchemaNode } from '../schema/node'
import { SchemaPage } from '../schema/page'
import { IFill, INode } from '../schema/type'
import { SchemaUtil } from '../schema/util'
import { StageDraw } from './draw/draw'
import { PIXI, Pixi } from './pixi'
import { StageViewport } from './viewport'

export type IStageElement = PIXI.Graphics | PIXI.Text

@autobind
export class StageElementService {
  canHover = true
  OBBCache = createCache<OBB>()
  pathCache = createCache<Path>()
  outlineCache = createCache<PIXI.Graphics>()
  hitAreaCache = createCache<(x: number, y: number) => boolean>()
  frameNameCache = createCache<PIXI.Text>()
  linearGradientCache = createCache<PIXI.Texture, IFill>()
  maskCache = createCache<PIXI.Graphics>()
  private containerMap = createCache<PIXI.Container>()
  private pagesElementMap = createCache<Cache<string, IStageElement>>()
  private mainContainer = new PIXI.Container()
  private get elementMap() {
    return this.pagesElementMap.getSet(SchemaPage.currentId.value, () => createCache())
  }
  initHook() {
    Pixi.inited.hook(() => {
      this.bindHover()
      this.mainContainer.setParent(Pixi.sceneStage)
    })
    SchemaNode.afterNodesAdded.hook((ids) => {
      ids.forEach((id) => this.create(SchemaNode.find(id)))
    })
    SchemaNode.afterNodesRemoved.hook((ids) => {
      ids.forEach((id) => this.delete(id))
    })
    SchemaNode.afterDelete.hook((nodes) => {
      nodes.forEach((node) => this.delete(node.id))
    })
    SchemaNode.afterConnect.hook(({ node, index }) => {
      this.connect(node)
    })
    SchemaNode.afterDisconnect.hook(({ node }) => {
      this.disConnect(node)
    })
  }
  create(node: INode) {
    const { id, type } = node
    const element = type === 'text' ? new PIXI.Text() : new PIXI.Graphics()
    this.elementMap.set(id, element)
    if (SchemaUtil.isContainerNode(node)) {
      const container = new PIXI.Container()
      const mask = new PIXI.Graphics()
      this.containerMap.set(id, container)
      this.maskCache.set(id, mask)
    }
    this.initOBB(id)
    this.initOutline(id)
    this.initTextResolution(node, element as PIXI.Text)
    return element
  }
  delete(id: string) {
    this.elementMap.get(id)?.destroy()
    this.elementMap.delete(id)
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
    return this.elementMap.get(id)
  }
  findContainer(id: string) {
    if (SchemaUtil.isPage(id)) return this.mainContainer
    return this.containerMap.get(id)
  }
  connect(node: INode) {
    const element = this.findElement(node.id)
    const selfContainer = this.findContainer(node.id)
    const parentContainer = this.findContainer(node.parentId)
    if (selfContainer) {
      selfContainer.setParent(parentContainer)
      element.setParent(selfContainer)
      const mask = this.maskCache.get(node.id)
      selfContainer.mask = mask
      mask.setParent(selfContainer)
    } else {
      element.setParent(parentContainer)
    }
  }
  disConnect(node: INode) {
    const container = this.findContainer(node.parentId)
    const element = this.findElement(node.id)
    container.removeChild(element)
  }
  clearAll() {
    this.elementMap.clear()
    this.OBBCache.clear()
    this.pathCache.clear()
    this.outlineCache.clear()
    // this.containerMap.clear()
    this.mainContainer.removeChildren()
  }
  findOrCreate(node: INode): IStageElement {
    let element = this.findElement(node.id)
    if (element) return element
    element = this.create(node)
    this.connect(node)
    return element
  }
  private bindHover() {
    const handler = batchSignal([SchemaNode.hoverIds], (e: Event) => {
      if (!this.canHover) return
      SchemaNode.clearHover()
      const realXY = StageViewport.toViewportXY(XY.From(e, 'client'))
      SchemaUtil.traverse(({ id }) => {
        const element = this.findElement(id)
        const hovered = element?.containsPoint(realXY)
        hovered ? SchemaNode.hover(id) : SchemaNode.unHover(id)
        return hovered
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
  private initTextResolution(node: INode, text: PIXI.Text) {
    if (node.type !== 'text') return
    StageViewport.zoom.hook((zoom) => {
      text.resolution = max(zoom, 1)
      StageDraw.collectRedraw(node.id)
    })
  }
}

export const StageElement = new StageElementService()
