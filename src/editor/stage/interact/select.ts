import autobind from 'class-autobind-decorator'
import hotkeys from 'hotkeys-js'
import { Editor } from '~/editor/editor/editor'
import { OBB } from '~/editor/math/obb'
import { OperateNode } from '~/editor/operate/node'
import { OperateText } from '~/editor/operate/text'
import { Schema } from '~/editor/schema/schema'
import { SchemaUtil } from '~/editor/schema/util'
import { UILeftPanelLayer } from '~/editor/ui-state/left-panel/layer'
import { Drag } from '~/global/event/drag'
import { Menu } from '~/global/menu'
import { batchSignal, createSignal } from '~/shared/signal/signal'
import { rectInAnotherRect } from '~/shared/utils/collision'
import { isLeftMouse, isRightMouse } from '~/shared/utils/event'
import { lastOne } from '~/shared/utils/list'
import { macro_Match } from '~/shared/utils/macro'
import { createBound, type IRect } from '~/shared/utils/normal'
import { Pixi } from '../pixi'
import { StageViewport } from '../viewport'
import { StageWidgetTransform } from '../widget/transform'

type ISelectType = 'panel' | 'create' | 'stage-single' | 'marquee'

@autobind
class StageSelectService {
  marquee = createSignal<IRect | undefined>()
  afterSelect = createSignal<ISelectType>()
  duringMarqueeSelect = createSignal()
  private marqueeOBB?: OBB
  private doubleClickTimeStamp?: number
  startInteract() {
    Pixi.addListener('mousedown', this.onMouseDown)
    Pixi.addListener('click', this.onClick)
  }
  endInteract() {
    Pixi.removeListener('mousedown', this.onMouseDown)
    Pixi.removeListener('click', this.onClick)
  }
  private get hoverId() {
    return lastOne(OperateNode.hoverIds.value)
  }
  private onMouseDown(e: Event) {
    if (isLeftMouse(e)) this.onLeftMouseDown(e as MouseEvent)
    if (isRightMouse(e)) this.onRightMouseDown(e as MouseEvent)
  }
  private onClick(e: Event) {
    if (this.hasDoubleClick(e)) this.onDoubleClick(e)
  }
  private onDoubleClick(e: Event) {
    this.onEditText()
    this.onEditVector()
  }
  private onEditText() {
    const hoverNode = Schema.find(this.hoverId)
    if (hoverNode?.type !== 'text') return
    OperateText.intoEditing.dispatch(hoverNode.id)
  }
  private onEditVector() {
    if (OperateNode.intoEditNodeId.value) OperateNode.intoEditNodeId.dispatch('')
    const hoverNode = Schema.find(this.hoverId)
    if (hoverNode?.type !== 'vector') return
    OperateNode.intoEditNodeId.dispatch(hoverNode.id)
  }
  private onLeftMouseDown(e: MouseEvent) {
    if (StageWidgetTransform.mouseOnEdge) return
    if (StageWidgetTransform.mouseIn(e)) return
    if (!this.hoverId) {
      this.clearSelect()
      this.onMarqueeSelect()
    }
    if (this.hoverId) {
      if (SchemaUtil.isPageFrame(this.hoverId)) {
        this.clearSelect()
        this.onMarqueeSelect()
      } else {
        this.onMousedownSelect()
      }
    }
  }
  private onRightMouseDown(e: MouseEvent) {
    if (this.hoverId) this.onMousedownSelect()
    this.onMenu()
  }
  private onMenu() {
    const { copyPasteGroup, undoRedoGroup, nodeGroup, nodeReHierarchyGroup } = Editor.commands
    if (OperateNode.selectedNodes.value.length) {
      const menuOptions = [nodeReHierarchyGroup, copyPasteGroup, undoRedoGroup, nodeGroup]
      return Menu.menuOptions.dispatch(menuOptions)
    }
    Menu.menuOptions.dispatch([undoRedoGroup])
  }
  private clearSelect() {
    if (hotkeys.shift) return
    OperateNode.clearSelect()
  }
  onPanelSelect(id: string) {
    this.clearSelect()
    OperateNode.select(id)
    this.afterSelect.dispatch('panel')
    OperateNode.commitFinalSelect()
  }
  onCreateSelect(id: string) {
    this.clearSelect()
    OperateNode.select(id)
    UILeftPanelLayer.expandAncestor(id)
    this.afterSelect.dispatch('create')
    OperateNode.commitSelect()
  }
  private onMousedownSelect() {
    if (Pixi.isForbidEvent) return
    if (OperateNode.selectIds.value.has(this.hoverId)) return
    if (SchemaUtil.isPageFrame(this.hoverId)) return
    this.clearSelect()
    OperateNode.select(this.hoverId)
    OperateNode.commitFinalSelect()
    UILeftPanelLayer.expandAncestor(this.hoverId)
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
    const traverseTest = () => {
      this.clearSelect()
      SchemaUtil.traverseCurPageChildIds(({ id, node, childIds, depth }) => {
        const { obb } = OperateNode.getNodeRuntime(node.id)
        if (childIds?.length && depth === 0) {
          if (rectInAnotherRect(obb.aabb, this.marqueeOBB!.aabb)) {
            OperateNode.select(node.id)
            UILeftPanelLayer.needExpandIds.add(node.id)
            return false
          }
          return
        }
        if (hitTest(this.marqueeOBB, obb)) {
          OperateNode.select(id)
          UILeftPanelLayer.needExpandIds.add(node.parentId)
          return
        }
        return false
      })
    }
    Drag.onStart(() => {
      this.marquee.value = createBound(0, 0, 0, 0)
    })
      .onMove(({ marquee }) => {
        this.marquee.dispatch(marquee)
        this.marqueeOBB = this.calcMarqueeOBB()
        const endBatch = batchSignal(OperateNode.selectIds)
        traverseTest()
        endBatch()
        this.duringMarqueeSelect.dispatch()
      })
      .onDestroy(() => {
        this.marquee.value = undefined
        this.marquee.dispatch()
        this.afterSelect.dispatch('marquee')
        OperateNode.commitFinalSelect()
      })
  }
  private calcMarqueeOBB() {
    if (!this.marquee.value) return
    const { x, y, width, height } = StageViewport.toSceneMarquee(this.marquee.value!)
    return new OBB(x + width / 2, y + height / 2, width, height, 0)
  }
  private hasDoubleClick(e: Event) {
    if (this.doubleClickTimeStamp && e.timeStamp - this.doubleClickTimeStamp <= 300) {
      this.doubleClickTimeStamp = undefined
      return true
    }
    this.doubleClickTimeStamp = e.timeStamp
    return false
  }
}

export const StageSelect = new StageSelectService()
