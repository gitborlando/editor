import { inject, injectable } from 'tsyringe'
import { createCache } from '~/shared/cache'
import { autobind } from '~/shared/decorator'
import { OBB } from '../math/obb'
import { Path } from '../math/path/path'
import { SchemaNodeService, injectSchemaNode } from '../schema/node'
import { PIXI, PixiService, injectPixi } from './pixi'

export type IStageElement = PIXI.Graphics | PIXI.Text

@autobind
@injectable()
export class StageElementService {
  OBBCache = createCache<OBB>()
  pathCache = createCache<Path>()
  outlineCache = createCache<PIXI.Graphics>()
  linearGradientCache = createCache<PIXI.Texture>()
  private elementMap: Map<string, IStageElement> = new Map()
  constructor(
    @injectPixi private Pixi: PixiService,
    @injectSchemaNode private SchemaNode: SchemaNodeService
  ) {
    SchemaNode.beforeDelete.hook((id) => this.delete(id))
  }
  add(id: string, element: IStageElement) {
    this.initOBB(id)
    this.initOutline(id)
    this.elementMap.set(id, element)
    this.setupElement(id, element)
  }
  delete(id: string) {
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
  private setupElement(id: string, element: IStageElement) {
    const node = this.SchemaNode.find(id)
    if (!element.parent) {
      const parent = this.find(node.parentId) || this.Pixi.sceneStage
      element.setParent(parent)
    }
    if (node.type === 'frame' && node.parentId.startsWith('page')) return
    element.eventMode = 'dynamic'
    element.on('mouseenter', () => this.SchemaNode.hover(id))
    element.on('mouseleave', () => this.SchemaNode.unHover())
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
