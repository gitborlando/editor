import { createCache } from '~/shared/cache'
import { autobind } from '~/shared/decorator'
import { XY } from '~/shared/structure/xy'
import { OBB } from '../math/obb'
import { Path } from '../math/path/path'
import { SchemaNode } from '../schema/node'
import { PIXI, Pixi } from './pixi'
import { StageViewport } from './viewport'

export type IStageElement = PIXI.Graphics | PIXI.Text

@autobind
export class StageElementService {
  canHover = true
  OBBCache = createCache<OBB>()
  pathCache = createCache<Path>()
  outlineCache = createCache<PIXI.Graphics>()
  linearGradientCache = createCache<PIXI.Texture>()
  private elementMap: Map<string, IStageElement> = new Map()
  initHook() {
    Pixi.inited.hook(this.bindHover)
    SchemaNode.beforeDelete.hook(({ id }) => this.delete(id))
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
    Pixi.sceneStage.removeChildren()
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
    const node = SchemaNode.find(id)
    if (!element.parent) element.setParent(Pixi.sceneStage)
  }
  private bindHover() {
    const handler = (e: Event) => {
      if (!this.canHover) return
      const realXY = StageViewport.toViewportXY(XY.From(e, 'client'))
      this.elementMap.forEach((element, id) => {
        const hovered = element?.containsPoint(realXY)
        hovered ? SchemaNode.hover(id) : SchemaNode.unHover(id)
      })
      SchemaNode.hoverIds.dispatch()
    }
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
