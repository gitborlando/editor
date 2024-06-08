import autobind from 'class-autobind-decorator'
import equal from 'fast-deep-equal'
import hotkeys from 'hotkeys-js'
import { AABB, OBB } from 'src/editor/math/obb'
import { OperateNode, getSelectIds } from 'src/editor/operate/node'
import { OperateText } from 'src/editor/operate/text'
import { Schema } from 'src/editor/schema/schema'
import { ID } from 'src/editor/schema/type'
import { ElemMouseEvent } from 'src/editor/stage/render/elem'
import { StageScene } from 'src/editor/stage/render/scene'
import { Surface } from 'src/editor/stage/render/surface'
import { StageWidgetTransform } from 'src/editor/stage/render/widget/transform'
import { UILeftPanelLayer } from 'src/editor/ui-state/left-panel/layer'
import { Drag } from 'src/global/event/drag'
import { batchSignal, createSignal } from 'src/shared/signal/signal'
import { firstOne } from 'src/shared/utils/array'
import { isLeftMouse, isRightMouse } from 'src/shared/utils/event'
import { macroMatch, type IRect } from 'src/shared/utils/normal'
import { SchemaUtil } from 'src/shared/utils/schema'

import { editorCommands } from 'src/editor/editor/command'
import { StageWidgetMarquee } from 'src/editor/stage/render/widget/marquee'
import { Menu } from 'src/global/menu'
import { StageViewport } from '../viewport'

type ISelectType = 'panel' | 'create' | 'stage-single' | 'marquee'

@autobind
class StageSelectService {
  marquee = createSignal<IRect | undefined>()
  afterSelect = createSignal<ISelectType>()
  duringMarqueeSelect = createSignal()
  private marqueeOBB?: OBB
  private doubleClickTimeStamp?: number
  private lastSelectIds = <ID[]>[]

  startInteract() {
    StageScene.sceneRoot.addEvent('mousedown', this.onMouseDown)
    Surface.addEvent('click', this.onClick)
  }

  endInteract() {
    StageScene.sceneRoot.removeEvent('mousedown', this.onMouseDown)
    Surface.removeEvent('click', this.onClick)
  }

  private get hoverId() {
    return firstOne(OperateNode.hoverIds.value)
  }

  private onMouseDown(e: ElemMouseEvent) {
    if (isLeftMouse(e.hostEvent)) this.onLeftMouseDown(e)
    if (isRightMouse(e.hostEvent)) this.onRightMouseDown(e)
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
    OperateNode.intoEditNodeId.dispatch(hoverNode.id)
  }

  private onLeftMouseDown(e: ElemMouseEvent) {
    this.lastSelectIds = [...OperateNode.selectIds.value]

    if (!this.hoverId) {
      this.clearSelect()
      this.onMarqueeSelect()
    } else {
      if (SchemaUtil.isPageFrame(this.hoverId)) {
        this.clearSelect()
        this.onMarqueeSelect()
      } else {
        this.onMousedownSelect()
        StageWidgetTransform.move()
      }
    }
  }

  private onRightMouseDown(e: ElemMouseEvent) {
    if (this.hoverId) this.onMousedownSelect()
    this.onMenu()
  }

  onMenu() {
    const { copyPasteGroup, undoRedoGroup, nodeGroup, nodeReHierarchyGroup } = editorCommands
    if (getSelectIds().length) {
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
    if (OperateNode.selectIds.value.has(this.hoverId)) return
    if (SchemaUtil.isPageFrame(this.hoverId)) return
    this.clearSelect()
    OperateNode.select(this.hoverId)
    if (equal([...OperateNode.selectIds.value], this.lastSelectIds)) return
    OperateNode.commitFinalSelect()
    UILeftPanelLayer.expandAncestor(this.hoverId)
    this.afterSelect.dispatch('stage-single')
  }

  private onMarqueeSelect() {
    const hitTest = (marqueeOBB: OBB | undefined, obb: OBB) => {
      if (!marqueeOBB) return false
      const aabbResult = AABB.Collide(marqueeOBB.aabb, obb.aabb)
      if (macroMatch`-180|-90|0|90|180`(obb.rotation)) return aabbResult
      return aabbResult && marqueeOBB.collide(obb)
    }
    const traverseTest = () => {
      this.clearSelect()
      SchemaUtil.traverseCurPageChildIds(({ id, node, childIds, depth }) => {
        const { obb } = StageScene.findElem(node.id)
        if (childIds?.length && depth === 0) {
          if (AABB.Include(this.marqueeOBB!.aabb, obb.aabb) === 1) {
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
      this.marquee.value = { x: 0, y: 0, width: 0, height: 0 }
    })
      .onMove(({ marquee }) => {
        this.marquee.dispatch(StageViewport.toSceneMarquee(marquee))
        this.marqueeOBB = StageWidgetMarquee.marqueeElem.obb
        const endBatch = batchSignal(OperateNode.selectIds)
        traverseTest()
        endBatch()
        this.duringMarqueeSelect.dispatch()
      })
      .onDestroy(() => {
        this.marquee.value = undefined
        this.marquee.dispatch()
        this.afterSelect.dispatch('marquee')
        if (equal([...OperateNode.selectIds.value], this.lastSelectIds)) return
        OperateNode.commitFinalSelect()
      })
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
