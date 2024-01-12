import { OBB } from '~/editor/math/obb'
import { SchemaNode } from '~/editor/schema/node'
import { SchemaPage } from '~/editor/schema/page'
import { SchemaUtil } from '~/editor/schema/util'
import { Drag } from '~/global/event/drag'
import { Menu } from '~/global/menu'
import { autobind } from '~/shared/decorator'
import { macro_Match } from '~/shared/macro'
import { createSignal } from '~/shared/signal'
import { XY } from '~/shared/structure/xy'
import { lastOne } from '~/shared/utils/array'
import { createBound, isLeftMouse, isRightMouse, type IBound } from '~/shared/utils/normal'
import { StageElement } from '../element'
import { Pixi } from '../pixi'
import { StageViewport } from '../viewport'
import { StageCreate } from './create'

type ISelectType = 'panel' | 'create' | 'stage-single' | 'marquee'

@autobind
export class StageSelectService {
  marquee = createSignal<IBound | undefined>()
  beforeSelect = createSignal()
  afterSelect = createSignal<ISelectType>()
  duringMarqueeSelect = createSignal()
  needExpandIds = new Set<string>()
  private marqueeOBB?: OBB
  initHook() {
    this.beforeSelect.hook(() => this.needExpandIds.clear())
    StageCreate.createStarted.hook(this.onCreateSelect)
  }
  startInteract() {
    Pixi.addListener('mousedown', this.onMousedownSelect)
    Pixi.addListener('mousedown', this.onMarqueeSelect)
    Pixi.addListener('mousedown', this.onMenu)
  }
  endInteract() {
    Pixi.removeListener('mousedown', this.onMousedownSelect)
    Pixi.removeListener('mousedown', this.onMarqueeSelect)
    Pixi.removeListener('mousedown', this.onMenu)
  }
  private get hoverId() {
    return lastOne(SchemaNode.hoverIds.value)
  }
  onPanelSelect(id: string) {
    this.beforeSelect.dispatch()
    SchemaNode.clearSelect()
    SchemaNode.select(id)
    this.afterSelect.dispatch('panel')
  }
  onCreateSelect(id: string) {
    this.beforeSelect.dispatch()
    SchemaNode.clearSelect()
    SchemaNode.select(id)
    let node = SchemaNode.find(id)
    while (node) {
      this.needExpandIds.add(node.parentId)
      node = SchemaNode.find(node.parentId)
    }
    this.afterSelect.dispatch('create')
  }
  private onMousedownSelect(e: Event) {
    if (!isLeftMouse(e)) return
    if (Pixi.isForbidEvent) return
    if (!this.hoverId) {
      SchemaNode.clearSelect()
      return this.afterSelect.dispatch('stage-single')
    }
    if (SchemaNode.selectIds.value.has(this.hoverId)) return
    if (SchemaUtil.parentIsPage(this.hoverId)) return
    this.beforeSelect.dispatch()
    SchemaNode.clearSelect()
    SchemaNode.select(this.hoverId)
    let node = SchemaNode.find(this.hoverId)
    while (node) {
      this.needExpandIds.add(node.parentId)
      node = SchemaNode.find(node.parentId)
    }
    this.afterSelect.dispatch('stage-single')
  }
  private onMarqueeSelect(e: Event) {
    if (!isLeftMouse(e)) return
    if (Pixi.isForbidEvent) return
    if (this.hoverId) return
    const hitTest = (marqueeOBB: OBB | undefined, obb: OBB) => {
      if (!marqueeOBB) return false
      const aabbResult = marqueeOBB.aabbHitTest(obb)
      if (macro_Match`-180|-90|0|90|180`(obb.rotation)) return aabbResult
      return aabbResult && marqueeOBB.obbHitTest(obb)
    }
    const traverseTest = (ids: string[]) => {
      ids.forEach((id) => {
        const OBB = StageElement.OBBCache.get(id)
        const node = SchemaNode.find(id)
        if (node.type === 'frame' && SchemaUtil.parentIsPage(id)) {
          return traverseTest(SchemaUtil.getChildIds(id))
        }
        if (hitTest(this.marqueeOBB, OBB)) {
          SchemaNode.select(id)
          this.needExpandIds.add(node.parentId)
          traverseTest(SchemaUtil.getChildIds(id))
        } else {
          SchemaNode.unSelect(id)
        }
      })
    }
    Drag.onStart(() => {
      this.marquee.value = createBound(0, 0, 0, 0)
      this.beforeSelect.dispatch()
      SchemaNode.clearSelect()
    })
      .onMove(({ marquee }) => {
        this.marquee.dispatch(marquee)
        this.marqueeOBB = this.calcMarqueeOBB()
        traverseTest(SchemaPage.currentPage.value.childIds)
        this.duringMarqueeSelect.dispatch()
      })
      .onDestroy(() => {
        this.marquee.value = undefined
        this.marquee.dispatch()
        this.afterSelect.dispatch('marquee')
      })
  }
  private onMenu(e: Event) {
    if (!isRightMouse(e)) return
    Menu.setShow(true)
    Menu.setXY(e.clientX, e.clientY)
  }
  private calcMarqueeOBB() {
    if (!this.marquee) return
    const { x, y } = StageViewport.toRealStageXY(
      XY.Of(this.marquee.value!.x, this.marquee.value!.y)
    )
    const { x: width, y: height } = StageViewport.toRealStageShiftXY(
      XY.Of(this.marquee.value!.width, this.marquee.value!.height)
    )
    return new OBB(x + width / 2, y + height / 2, width, height, 0)
  }
}

export const StageSelect = new StageSelectService()
