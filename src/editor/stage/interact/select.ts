import { AABB, OBB } from '@gitborlando/geo'
import { firstOne } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'
import equal from 'fast-deep-equal'
import hotkeys from 'hotkeys-js'
import { makeObservable, observable } from 'mobx'
import { EditorCommand } from 'src/editor/editor/command'
import { OperateNode } from 'src/editor/operate/node'
import { OperateText } from 'src/editor/operate/text'
import { Schema } from 'src/editor/schema/schema'
import { ID, IFrame, INode } from 'src/editor/schema/type'
import { getSelectIds, YClients } from 'src/editor/schema/y-clients'
import { ElemMouseEvent } from 'src/editor/stage/render/elem'
import { StageScene } from 'src/editor/stage/render/scene'
import { Surface } from 'src/editor/stage/render/surface'
import { StageTransform } from 'src/editor/stage/render/widget/transform'
import { StageViewport } from 'src/editor/stage/viewport'
import { UILeftPanelLayer } from 'src/editor/ui-state/left-panel/layer'
import { Drag } from 'src/global/event/drag'
import { Menu } from 'src/global/menu'
import { createSignal } from 'src/shared/signal/signal'
import { isLeftMouse, isRightMouse } from 'src/shared/utils/event'
import { macroMatch, type IRect } from 'src/shared/utils/normal'
import { SchemaUtil } from 'src/shared/utils/schema'

type ISelectType = 'panel' | 'create' | 'stage-single' | 'marquee'

@autobind
class StageSelectService {
  marquee: IRect = { x: 0, y: 0, width: 0, height: 0 }

  afterSelect = createSignal<ISelectType>()
  private marqueeOBB?: OBB
  private lastSelectIds = <ID[]>[]

  constructor() {
    makeObservable(this, {
      marquee: observable,
    })
  }

  startInteract() {
    StageScene.sceneRoot.addEvent('mousedown', this.onMouseDown)
    Surface.addEvent('click', this.onClick)
    Surface.addEvent('dblclick', this.onDoubleClick)
  }

  endInteract() {
    StageScene.sceneRoot.removeEvent('mousedown', this.onMouseDown)
    Surface.removeEvent('click', this.onClick)
    Surface.removeEvent('dblclick', this.onDoubleClick)
  }

  private get hoverId() {
    return firstOne(StageScene.elemsFromPoint())?.id
  }

  private onMouseDown(e: ElemMouseEvent) {
    if (isLeftMouse(e.hostEvent)) this.onLeftMouseDown(e)
    if (isRightMouse(e.hostEvent)) this.onRightMouseDown(e)
  }

  private onClick(e: Event) {}

  private onDoubleClick(e: Event) {
    if (!this.hoverId) return

    const hoverSelected = OperateNode.selectIds.value.has(this.hoverId)
    const hoverNode = Schema.find(this.hoverId)

    if (hoverSelected) {
      if (hoverNode.type === 'text') {
        this.onEditText(hoverNode)
      }
      if (SchemaUtil.is<IFrame>(hoverNode, 'frame')) {
        this.onEditVector(hoverNode)
      }
    } else if (OperateNode.selectIds.value.size === 1) {
      const ancestor = SchemaUtil.findAncestor(
        this.hoverId,
        (node) => node.parentId === firstOne(OperateNode.selectIds.value),
      )
      this.onSelect(ancestor.id)
    }
  }

  private onEditText(hoverNode: INode) {
    OperateText.intoEditing.dispatch(hoverNode.id)
  }

  private onEditVector(hoverNode: INode) {
    if (OperateNode.intoEditNodeId.value) {
      OperateNode.intoEditNodeId.dispatch('')
      OperateNode.clearSelect()
      return
    }
    hoverNode && OperateNode.intoEditNodeId.dispatch(hoverNode.id)
  }

  private onDeepSelect() {
    const hoverNode = Schema.find(this.hoverId!)
    if (hoverNode?.type !== 'text') return
    OperateText.intoEditing.dispatch(hoverNode.id)
  }

  private onLeftMouseDown(e: ElemMouseEvent) {
    this.lastSelectIds = getSelectIds()

    if (!this.hoverId) {
      this.clearSelect()
      this.onMarqueeSelect()
      return
    }

    if (SchemaUtil.isPageFrame(this.hoverId)) {
      this.clearSelect()
      this.onMarqueeSelect()
    } else {
      this.onMousedownSelect()
      StageTransform.move(e)
    }
  }

  private onRightMouseDown(e: ElemMouseEvent) {
    if (this.hoverId) this.onMousedownSelect()
    this.onMenu()
  }

  onMenu() {
    const { copyPasteGroup, undoRedoGroup, nodeGroup, nodeReHierarchyGroup } = EditorCommand
    if (getSelectIds().length) {
      const menuOptions = [nodeReHierarchyGroup, copyPasteGroup, undoRedoGroup, nodeGroup]
      return Menu.menuOptions.dispatch(menuOptions)
    }
    Menu.menuOptions.dispatch([undoRedoGroup])
  }

  private clearSelect() {
    if (hotkeys.shift) return
    YClients.clearSelect()
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
    this.onSelect(this.hoverId!)
    this.afterSelect.dispatch('stage-single')
  }

  private onSelect(id: ID) {
    if (OperateNode.selectIds.value.has(id)) return
    if (SchemaUtil.isPageFrame(id)) return
    this.clearSelect()
    OperateNode.select(id)
    if (equal([...OperateNode.selectIds.value], this.lastSelectIds)) return
    OperateNode.commitFinalSelect()
    UILeftPanelLayer.expandAncestor(id)
  }

  private onMarqueeSelect() {
    const hitTest = (marqueeOBB: OBB | undefined, obb: OBB) => {
      if (!marqueeOBB) return false
      const aabbResult = AABB.collide(marqueeOBB.aabb, obb.aabb)
      if (macroMatch`-180|-90|0|90|180`(obb.rotation)) return aabbResult
      return aabbResult && marqueeOBB.collide(obb)
    }

    const traverseTest = () => {
      this.clearSelect()
      SchemaUtil.traverseCurPageChildIds(({ id, node, childIds, depth }) => {
        const elem = StageScene.findElem(id)
        if (!elem.visible) return false

        if (childIds?.length && depth === 0) {
          if (AABB.include(this.marqueeOBB!.aabb, elem.aabb) === 1) {
            YUndo.untrackScope(() => YClients.select(id))
            UILeftPanelLayer.needExpandIds.add(id)
            return false
          }
          return
        }
        if (hitTest(this.marqueeOBB, elem.obb)) {
          YUndo.untrackScope(() => YClients.select(id))
          UILeftPanelLayer.needExpandIds.add(node.parentId)
          return
        }
        return false
      })
    }

    Surface.disablePointEvent()
    Drag.onStart()
      .onMove(({ marquee }) => {
        this.marquee = StageViewport.toSceneMarquee(marquee)
        this.marqueeOBB = OBB.fromRect(this.marquee)
        traverseTest()
      })
      .onDestroy(() => {
        this.marquee = { x: 0, y: 0, width: 0, height: 0 }
        this.afterSelect.dispatch('marquee')

        if (!equal(getSelectIds(), this.lastSelectIds)) {
          YUndo.track({ type: 'client', description: `选中 ${getSelectIds().length} 个节点` })
        }
      })
  }
}

export const StageSelect = new StageSelectService()
