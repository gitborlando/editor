import autobind from 'class-autobind-decorator'
import { createCache } from '~/shared/cache'
import { batchSignal } from '~/shared/signal'
import { XY } from '~/shared/structure/xy'
import { OBB } from '../math/obb'
import { Path } from '../math/path/path'
import { SchemaNode } from '../schema/node'
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
  frameNameCache = createCache<PIXI.Text>()
  linearGradientCache = createCache<PIXI.Texture>()
  private elementMap: Map<string, IStageElement> = new Map()
  private elementContainer = new PIXI.Container()
  initHook() {
    Pixi.inited.hook(() => {
      this.bindHover()
      this.elementContainer.setParent(Pixi.sceneStage)
    })
    SchemaNode.afterAdd.hook((nodes) => {
      nodes.forEach((node) => this.add(node.id, node.type === 'text' ? 'text' : 'graphic'))
    })
    SchemaNode.afterDelete.hook((nodes) => {
      nodes.forEach((node) => this.delete(node.id))
    })
  }
  add(id: string, type: 'graphic' | 'text') {
    const element = type === 'graphic' ? new PIXI.Graphics() : new PIXI.Text()
    this.elementMap.set(id, element)
    element.setParent(this.elementContainer)
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
      this.add(id, type)
      return this.find(id)
    }
  }
  private bindHover() {
    const handler = batchSignal([SchemaNode.hoverIds], (e: Event) => {
      if (!this.canHover) return
      const realXY = StageViewport.toViewportXY(XY.From(e, 'client'))
      this.elementMap.forEach((element, id) => {
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
