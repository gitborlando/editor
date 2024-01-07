import { inject, injectable } from 'tsyringe'
import { createCache } from '~/shared/cache'
import { autobind } from '~/shared/decorator'
import { XY } from '~/shared/structure/xy'
import { OBB } from '../math/obb'
import { Path } from '../math/path/path'
import { SchemaNodeService, injectSchemaNode } from '../schema/node'
import { PIXI, PixiService, injectPixi } from './pixi'
import { StageViewportService, injectStageViewport } from './viewport'

export type IStageElement = PIXI.Graphics | PIXI.Text

@autobind
@injectable()
export class StageElementService {
  private elementMap: Map<string, IStageElement> = new Map()
  OBBCache = createCache<OBB>()
  pathCache = createCache<Path>()
  outlineCache = createCache<PIXI.Graphics>()
  linearGradientCache = createCache<PIXI.Texture>()
  constructor(
    @injectPixi private Pixi: PixiService,
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectStageViewport private StageViewport: StageViewportService
  ) {
    this.Pixi.inited.hook(this.bindHover)
    SchemaNode.beforeDelete.hook((id) => this.delete(id))
  }
  add(id: string, element: IStageElement) {
    this.initOBB(id)
    this.initOutline(id)
    this.elementMap.set(id, element)
    this.setupElement(id, element)
  }
  delete(id: string) {
    this.elementMap.get(id)?.destroy()
    this.elementMap.delete(id)
    this.OBBCache.delete(id)
    this.pathCache.delete(id)
    this.outlineCache.delete(id)
  }
  find(id: string) {
    return this.elementMap.get(id)
  }
  clearAll() {
    this.Pixi.sceneStage.removeChildren()
    this.elementMap = new Map()
    this.OBBCache.clear()
    this.pathCache.clear()
    this.outlineCache.clear()
  }
  findOrCreate(id: string, type: 'graphic'): PIXI.Graphics
  findOrCreate(id: string, type: 'text'): PIXI.Text
  findOrCreate(id: string, type: 'graphic' | 'text') {
    let element = this.find(id)
    if (element) {
      return type === 'graphic' ? <PIXI.Graphics>element : <PIXI.Text>element
    } else {
      element = type === 'graphic' ? new PIXI.Graphics() : new PIXI.Text()
      this.add(id, element)
      return element
    }
  }
  findParentElement(parentId: string) {
    return this.find(parentId) || this.Pixi.sceneStage
  }
  private setupElement(id: string, element: IStageElement) {
    const node = this.SchemaNode.find(id)
    if (!element.parent) {
      element.setParent(this.findParentElement(node.parentId))
    }
  }
  private bindHover() {
    const handler = (e: Event) => {
      const realXY = this.StageViewport.toViewportXY(XY.From(e, 'client'))
      this.elementMap.forEach((element, id) => {
        const hovered = element?.containsPoint(realXY)
        hovered ? this.SchemaNode.hover(id) : this.SchemaNode.unHover(id)
      })
      this.SchemaNode.hoverIds.dispatch()
    }
    this.Pixi.addListener('mousemove', handler, { capture: true })
  }
  private initOBB(id: string) {
    const { centerX, centerY, width, height, rotation } = this.SchemaNode.find(id)
    const obb = new OBB(centerX, centerY, width, height, rotation)
    this.OBBCache.set(id, obb)
  }
  private initOutline(id: string) {
    this.outlineCache.set(id, new PIXI.Graphics())
  }
}

export const injectStageElement = inject(StageElementService)
