import { makeObservable, observable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { OBB } from '~/editor/math/obb'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { SchemaPageService, injectSchemaPage } from '~/editor/schema/page'
import { SchemaUtilService, injectSchemaUtil } from '~/editor/schema/util'
import { DragService, injectDrag } from '~/global/drag'
import { MenuService, injectMenu } from '~/global/menu'
import { autobind } from '~/shared/decorator'
import { createHooker } from '~/shared/hooker'
import { macro_Match } from '~/shared/macro'
import { XY } from '~/shared/structure/xy'
import { createBound, isLeftMouse, isRightMouse, type IBound } from '~/shared/utils/normal'
import { StageElementService, injectStageElement } from '../element'
import { PixiService, injectPixi } from '../pixi'
import { StageViewportService, injectStageViewport } from '../viewport'

@autobind
@injectable()
export class StageSelectService {
  @observable marquee?: IBound
  beforeSelect = createHooker()
  afterSelect = createHooker<['panel' | 'stage-single' | 'marquee']>()
  duringMarqueeSelect = createHooker()
  needExpandIds = new Set<string>()
  private marqueeOBB?: OBB
  constructor(
    @injectPixi private Pixi: PixiService,
    @injectDrag private Drag: DragService,
    @injectStageViewport private StageViewport: StageViewportService,
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectMenu private Menu: MenuService,
    @injectStageElement private StageElement: StageElementService,
    @injectSchemaPage private SchemaPage: SchemaPageService,
    @injectSchemaUtil private SchemaUtil: SchemaUtilService
  ) {
    makeObservable(this)
    this.beforeSelect.hook(() => this.needExpandIds.clear())
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
    const hoverIds = [...this.SchemaNode.hoverIds.value]
    return hoverIds[hoverIds.length - 1]
  }
  onPanelSelect(id: string) {
    this.beforeSelect.dispatch()
    this.SchemaNode.clearSelect()
    this.SchemaNode.select(id)
    this.afterSelect.dispatch('panel')
  }
  private onMousedownSelect(e: Event) {
    if (!isLeftMouse(e)) return
    if (this.Pixi.isForbidEvent) return
    if (!this.hoverId) {
      this.SchemaNode.clearSelect()
      return this.afterSelect.dispatch('stage-single')
    }
    if (this.SchemaNode.selectIds.value.has(this.hoverId)) return
    if (this.SchemaUtil.parentIsPage(this.hoverId)) return
    this.beforeSelect.dispatch()
    this.SchemaNode.clearSelect()
    this.SchemaNode.select(this.hoverId)
    let node = this.SchemaNode.find(this.hoverId)
    while (node) {
      this.needExpandIds.add(node.parentId)
      node = this.SchemaNode.find(node.parentId)
    }
    this.afterSelect.dispatch('stage-single')
  }
  private onMarqueeSelect(e: Event) {
    if (!isLeftMouse(e)) return
    if (this.Pixi.isForbidEvent) return
    if (this.hoverId) return
    const hitTest = (marqueeOBB: OBB | undefined, obb: OBB) => {
      if (!marqueeOBB) return false
      const aabbResult = marqueeOBB.aabbHitTest(obb)
      if (macro_Match`-180|-90|0|90|180`(obb.rotation)) return aabbResult
      return aabbResult && marqueeOBB.obbHitTest(obb)
    }
    const traverseTest = (ids: string[]) => {
      ids.forEach((id) => {
        const OBB = this.StageElement.OBBCache.get(id)
        const node = this.SchemaNode.find(id)
        if (node.type === 'frame' && this.SchemaUtil.parentIsPage(id)) {
          return traverseTest(this.SchemaUtil.getChildIds(id))
        }
        if (hitTest(this.marqueeOBB, OBB)) {
          this.SchemaNode.select(id)
          this.needExpandIds.add(node.parentId)
          traverseTest(this.SchemaUtil.getChildIds(id))
        } else {
          this.SchemaNode.unSelect(id)
        }
      })
    }
    let startedSelect = false
    this.Drag.onStart(() => {
      this.marquee = createBound(0, 0, 0, 0)
    })
      .onMove(({ marquee }) => {
        if (!startedSelect) {
          this.beforeSelect.dispatch()
          this.SchemaNode.clearSelect()
          startedSelect = true
        }
        this.marquee = marquee
        this.marqueeOBB = this.calcMarqueeOBB()
        traverseTest(this.SchemaPage.currentPage.childIds)
        this.duringMarqueeSelect.dispatch()
      })
      .onDestroy(() => {
        this.marquee = undefined
        if (startedSelect) this.afterSelect.dispatch('marquee')
      })
  }
  private onMenu(e: Event) {
    if (!isRightMouse(e)) return
    this.Menu.setShow(true)
    this.Menu.setXY(e.clientX, e.clientY)
  }
  private calcMarqueeOBB() {
    if (!this.marquee) return
    const { x, y } = this.StageViewport.toRealStageXY(XY.Of(this.marquee.x, this.marquee.y))
    const { x: width, y: height } = this.StageViewport.toRealStageShiftXY(
      XY.Of(this.marquee.width, this.marquee.height)
    )
    return new OBB(x + width / 2, y + height / 2, width, height, 0)
  }
}

export const injectStageSelect = inject(StageSelectService)
