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
  private elementMap: Map<string, IStageElement> = new Map()
  constructor(
    @injectPixi private Pixi: PixiService,
    @injectSchemaNode private SchemaNode: SchemaNodeService
  ) {
    SchemaNode.beforeDelete.hook((id) => this.delete(id))
  }
  add(id: string, element: IStageElement) {
    this.elementMap.set(id, element)
    this.setupElement(id, element)
    this.initOBB(id)
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
    this.Pixi.stage.removeChildren()
    this.elementMap = new Map()
  }
  private setupElement(id: string, element: IStageElement) {
    const { parentId } = this.SchemaNode.find(id)
    if (!element.parent) {
      const parent = this.find(parentId) || this.Pixi.stage
      element.setParent(parent)
    }
    element.eventMode = 'dynamic'
    element.on('mouseenter', () => this.SchemaNode.hover(id))
    element.on('mouseleave', () => this.SchemaNode.unHover())
  }
  private initOBB(id: string) {
    const { centerX, centerY, width, height, rotation, scaleX, scaleY } = this.SchemaNode.find(id)
    const obb = new OBB(centerX, centerY, width, height, rotation, scaleX, scaleY)
    this.OBBCache.set(id, obb)
  }
}

export const injectStageElement = inject(StageElementService)
