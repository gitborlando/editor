import { makeObservable, observable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { OBB } from '~/editor/math/obb'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { DragService, injectDrag } from '~/global/drag'
import { MenuService, injectMenu } from '~/global/menu'
import { autobind } from '~/shared/decorator'
import { createHooker } from '~/shared/hooker'
import { macro_Match } from '~/shared/macro'
import { XY } from '~/shared/structure/xy'
import { createBound, isLeftMouse, type IBound } from '~/shared/utils'
import { StageElementService, injectStageElement } from '../element'
import { PixiService, injectPixi } from '../pixi'
import { StageViewportService, injectStageViewport } from '../viewport'

@autobind
@injectable()
export class StageSelectService {
  @observable marquee?: IBound
  duringSelect = createHooker()
  beforeSelect = createHooker()
  afterSelect = createHooker<['single' | 'marquee']>()
  private marqueeOBB?: OBB
  constructor(
    @injectPixi private Pixi: PixiService,
    @injectDrag private Drag: DragService,
    @injectStageViewport private StageViewport: StageViewportService,
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectMenu private Menu: MenuService,
    @injectStageElement private StageElement: StageElementService
  ) {
    makeObservable(this)
  }
  startInteract() {
    this.Pixi.addListener('mousedown', this.onMousedownSelect)
    this.Pixi.addListener('mousedown', this.onMarqueeSelect)
    this.Pixi.addListener('mousedown', this.onMenu)
  }
  endInteract() {
    this.Pixi.removeListener('mousedown', this.onMousedownSelect)
    this.Pixi.removeListener('mousedown', this.onMarqueeSelect)
    this.Pixi.removeListener('mousedown', this.onMenu)
  }
  private get hoverId() {
    return this.SchemaNode.hoverId
  }
  private onMousedownSelect(e: Event) {
    if (!isLeftMouse(e)) return
    if (this.Pixi.isForbidEvent) return
    if (!this.hoverId) return this.SchemaNode.clearSelection()
    if (this.SchemaNode.selectIds?.has(this.hoverId)) return
    this.beforeSelect.dispatch()
    this.SchemaNode.clearSelection()
    this.SchemaNode.select(this.hoverId)
    this.afterSelect.dispatch('single')
  }
  private onMarqueeSelect(_e: Event) {
    const e = _e as MouseEvent
    if (e.button !== 0) return
    if (this.Pixi.isForbidEvent) return
    if (this.hoverId) return
    const hitTest = (marqueeOBB: OBB | undefined, obb: OBB) => {
      if (!marqueeOBB) return false
      const aabbResult = marqueeOBB.aabbHitTest(obb)
      if (macro_Match`-180|-90|0|90|180`(obb.rotation)) return aabbResult
      return aabbResult && marqueeOBB.obbHitTest(obb)
    }
    const nodesIds = Object.keys(this.SchemaNode.nodeMap)
    this.Drag.onStart(() => {
      this.SchemaNode.clearSelection()
      this.marquee = createBound(0, 0, 0, 0)
      this.beforeSelect.dispatch()
    })
      .onMove(({ marquee }) => {
        this.marquee = marquee
        this.marqueeOBB = this.calcMarqueeOBB()
        nodesIds.forEach((id) => {
          const OBB = this.StageElement.OBBCache.get(id)
          hitTest(this.marqueeOBB, OBB) ? this.SchemaNode.select(id) : this.SchemaNode.unSelect(id)
        })
        this.duringSelect.dispatch()
      })
      .onEnd(({ dragService }) => {
        this.marquee = undefined
        this.afterSelect.dispatch('marquee')
        dragService.destroy()
      })
  }
  private onMenu(_e: Event) {
    const e = _e as MouseEvent
    if (e.button !== 2) return
    this.Menu.setShow(true)
    this.Menu.setXY(e.clientX, e.clientY)
  }
  private calcMarqueeOBB() {
    if (!this.marquee) return
    const { x, y } = this.StageViewport.toRealStageXY(XY.Of(this.marquee.x, this.marquee.y))
    const { x: width, y: height } = this.StageViewport.toRealStageShift(
      XY.Of(this.marquee.width, this.marquee.height)
    )
    return new OBB(x + width / 2, y + height / 2, width, height, 0)
  }
}

export const injectStageSelect = inject(StageSelectService)
