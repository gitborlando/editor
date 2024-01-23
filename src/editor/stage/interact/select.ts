import autobind from 'class-autobind-decorator'
import hotkeys from 'hotkeys-js'
import { OBB } from '~/editor/math/obb'
import { Record, recordSignalContext } from '~/editor/record'
import { SchemaNode } from '~/editor/schema/node'
import { SchemaPage } from '~/editor/schema/page'
import { INode } from '~/editor/schema/type'
import { SchemaUtil } from '~/editor/schema/util'
import { Drag } from '~/global/event/drag'
import { Menu } from '~/global/menu'
import { createMomentChange } from '~/shared/intercept-data/moment-change'
import { batchSignal, createSignal } from '~/shared/signal'
import { XY } from '~/shared/structure/xy'
import { lastOne } from '~/shared/utils/array'
import { rectInAnotherRect } from '~/shared/utils/collision'
import { macro_Match } from '~/shared/utils/macro'
import {
  createBound,
  fastDeepEqual,
  isLeftMouse,
  isRightMouse,
  type IRect,
} from '~/shared/utils/normal'
import { StageElement } from '../element'
import { Pixi } from '../pixi'
import { StageViewport } from '../viewport'
import { StageWidgetTransform } from '../widget/transform'
import { StageCreate } from './create'

type ISelectType = 'panel' | 'create' | 'stage-single' | 'marquee'

@autobind
export class StageSelectService {
  marquee = createSignal<IRect | undefined>()
  afterClearSelect = createSignal()
  afterSelect = createSignal<ISelectType>()
  duringMarqueeSelect = createSignal()
  needExpandIds = new Set<string>()
  private marqueeOBB?: OBB
  private oneSelectChange = createMomentChange({ selectIds: <string[]>[] })
  initHook() {
    StageCreate.createStarted.hook(this.onCreateSelect)
    this.afterClearSelect.hook(() => {
      this.needExpandIds.clear()
    })
    this.afterSelect.hook(() => {
      this.oneSelectChange.update('selectIds', [...SchemaNode.selectIds.value])
      this.recordSelect()
      this.oneSelectChange.endCurrent()
    })
  }
  startInteract() {
    Pixi.addListener('mousedown', this.onMouseDown)
    Pixi.addListener('mousedown', this.onMenu)
  }
  endInteract() {
    Pixi.removeListener('mousedown', this.onMouseDown)
    Pixi.removeListener('mousedown', this.onMenu)
  }
  private get hoverId() {
    return lastOne(SchemaNode.hoverIds.value)
  }
  private onMouseDown(e: Event) {
    if (isLeftMouse(e)) this.onLeftMouseDown(e as MouseEvent)
    if (isRightMouse(e)) this.onRightMouseDown(e as MouseEvent)
  }
  private onLeftMouseDown(e: MouseEvent) {
    if (StageWidgetTransform.mouseIn(e)) return
    if (!this.hoverId) {
      this.clearSelect()
      this.onMarqueeSelect()
    }
    if (this.hoverId) {
      if (SchemaUtil.isPageFrameId(this.hoverId)) {
        this.clearSelect()
        this.onMarqueeSelect()
      } else {
        this.onMousedownSelect()
      }
    }
  }
  private onRightMouseDown(e: MouseEvent) {}
  private clearSelect() {
    if (hotkeys.shift) return
    SchemaNode.clearSelect()
    this.afterClearSelect.dispatch()
  }
  private unSelect(id: string) {
    if (hotkeys.shift) return
    SchemaNode.unSelect(id)
  }
  onPanelSelect(id: string) {
    this.clearSelect()
    SchemaNode.select(id)
    this.afterSelect.dispatch('panel')
  }
  onCreateSelect(id: string) {
    this.clearSelect()
    SchemaNode.select(id)
    let node = SchemaNode.find(id)
    while (node) {
      this.needExpandIds.add(node.parentId)
      node = SchemaNode.find(node.parentId)
    }
    this.afterSelect.dispatch('create')
  }
  private onMousedownSelect() {
    if (Pixi.isForbidEvent) return
    if (SchemaNode.selectIds.value.has(this.hoverId)) return
    if (SchemaUtil.isPageFrameId(this.hoverId)) return
    this.clearSelect()
    SchemaNode.select(this.hoverId)
    let node = SchemaNode.find(this.hoverId)
    while (node) {
      this.needExpandIds.add(node.parentId)
      node = SchemaNode.find(node.parentId)
    }
    this.afterSelect.dispatch('stage-single')
  }
  private onMarqueeSelect() {
    if (Pixi.isForbidEvent) return
    const hitTest = (marqueeOBB: OBB | undefined, obb: OBB) => {
      if (!marqueeOBB) return false
      const aabbResult = marqueeOBB.aabbHitTest(obb)
      if (macro_Match`-180|-90|0|90|180`(obb.rotation)) return aabbResult
      return aabbResult && marqueeOBB.obbHitTest(obb)
    }
    const unSelect = (id: string) => {
      if (hotkeys.shift && SchemaNode.selectIds.value.has(id)) return
      SchemaNode.unSelect(id)
    }
    const traverseTest = (nodes: INode[]) => {
      nodes.forEach((node) => {
        const OBB = StageElement.OBBCache.get(node.id)
        if (SchemaUtil.isPageFrameNode(node) && node.childIds.length) {
          if (rectInAnotherRect(OBB.aabb, this.marqueeOBB!.aabb)) {
            SchemaNode.select(node.id)
            this.needExpandIds.add(node.id)
            SchemaUtil.traverseIds(node.childIds, ({ id }) => SchemaNode.unSelect(id))
          } else {
            unSelect(node.id)
            traverseTest(SchemaUtil.getChildren(node.id))
          }
          return
        }
        if (hitTest(this.marqueeOBB, OBB)) {
          SchemaNode.select(node.id)
          this.needExpandIds.add(node.parentId)
          traverseTest(SchemaUtil.getChildren(node.id))
        } else {
          unSelect(node.id)
        }
      })
    }
    Drag.onStart(() => {
      this.marquee.value = createBound(0, 0, 0, 0)
    })
      .onMove(({ marquee }) => {
        this.marquee.dispatch(marquee)
        this.marqueeOBB = this.calcMarqueeOBB()
        const batchTest = batchSignal([SchemaNode.selectIds], traverseTest)
        batchTest(SchemaPage.currentPage.value.childIds.map((id) => SchemaNode.find(id)))
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
    if (!this.marquee.value) return
    const marquee = this.marquee.value!
    const { x, y } = StageViewport.toSceneStageXY(XY.Of(marquee.x, marquee.y))
    const width = StageViewport.toSceneStageShift(marquee.width)
    const height = StageViewport.toSceneStageShift(marquee.height)
    return new OBB(x + width / 2, y + height / 2, width, height, 0)
  }
  private recordSelect() {
    if (recordSignalContext()) return
    const { last, current } = this.oneSelectChange.record.selectIds
    if (fastDeepEqual(last, current)) return
    Record.push({
      description: '选择节点',
      detail: { last: [...last], current: [...current] },
      undo: () => {
        SchemaNode.selectIds.dispatch(new Set(last))
        this.afterSelect.dispatch()
      },
      redo: () => {
        SchemaNode.selectIds.dispatch(new Set(current))
        this.afterSelect.dispatch()
      },
    })
  }
}

export const StageSelect = new StageSelectService()
