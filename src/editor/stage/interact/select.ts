import { AABB, OBB } from '@gitborlando/geo'
import { firstOne } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'
import equal from 'fast-deep-equal'
import hotkeys from 'hotkeys-js'
import { observable } from 'mobx'
import { EditorCommand } from 'src/editor/editor/command'
import { OperateNode } from 'src/editor/operate/node'
import { OperateText } from 'src/editor/operate/text'
import { Schema } from 'src/editor/schema/schema'
import { ID, IFrame, INode } from 'src/editor/schema/type'
import { SchemaUtil2, SchemaUtilTraverseData } from 'src/editor/schema/utils'
import { getSelectIdMap, YClients } from 'src/editor/schema/y-clients'
import { ElemMouseEvent } from 'src/editor/stage/render/elem'
import { StageScene } from 'src/editor/stage/render/scene'
import { Surface } from 'src/editor/stage/render/surface'
import { StageViewport } from 'src/editor/stage/viewport'
import { UILeftPanelLayer } from 'src/editor/ui-state/left-panel/layer'
import { Drag } from 'src/global/event/drag'
import { Menu } from 'src/global/menu'
import { isLeftMouse, isRightMouse } from 'src/shared/utils/event'
import { macroMatch, type IRect } from 'src/shared/utils/normal'
import { SchemaUtil } from 'src/shared/utils/schema'
import { moveTransformer } from 'src/view/editor/stage/transform'

type ISelectType = 'panel' | 'create' | 'stage-single' | 'marquee'

@autobind
class StageSelectService {
  @observable marquee: IRect = { x: 0, y: 0, width: 0, height: 0 }

  afterSelect = Signal.create<ISelectType>()
  private marqueeOBB?: OBB
  private lastSelectIdMap = <Record<string, boolean>>{}

  startInteract() {
    StageScene.sceneRoot.addEvent('mousedown', this.onMouseDown)
    Surface.addEvent('click', this.onClick)
    Surface.addEvent('dblclick', this.onDoubleClick)

    return () => {
      StageScene.sceneRoot.removeEvent('mousedown', this.onMouseDown)
      Surface.removeEvent('click', this.onClick)
      Surface.removeEvent('dblclick', this.onDoubleClick)
    }
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
    this.lastSelectIdMap = getSelectIdMap()

    if (!this.hoverId || SchemaUtil2.isFirstLayerFrame(this.hoverId)) {
      this.clearSelect()
      this.onMarqueeSelect()
      return
    }

    this.onMousedownSelect()
    moveTransformer(e)
  }

  private onRightMouseDown(e: ElemMouseEvent) {
    if (this.hoverId) this.onMousedownSelect()
    this.onMenu()
  }

  onMenu() {
    const { copyPasteGroup, undoRedoGroup, nodeGroup, nodeReHierarchyGroup } = EditorCommand
    if (getSelectIdMap().length) {
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
    YClients.select(id)
    this.afterSelect.dispatch('panel')
    YUndo.track({ type: 'client', description: `选中节点 ${id}` })
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
    if (getSelectIdMap()[id]) return
    if (SchemaUtil2.isFirstLayerFrame(id)) return

    this.clearSelect()
    YClients.select(id)

    if (!equal(getSelectIdMap(), this.lastSelectIdMap)) {
      YUndo.track({
        type: 'client',
        description: `选中 ${Object.keys(getSelectIdMap()).length} 个节点`,
      })
      // UILeftPanelLayer.expandAncestor(id)
    }
  }

  private onMarqueeSelect() {
    const hitTest = (marqueeOBB: OBB | undefined, obb: OBB) => {
      if (!marqueeOBB) return false
      const aabbResult = AABB.collide(marqueeOBB.aabb, obb.aabb)
      if (macroMatch`-180|-90|0|90|180`(obb.rotation)) return aabbResult
      return aabbResult && marqueeOBB.collide(obb)
    }

    const traverseTest = ({ id, node, childIds, depth }: SchemaUtilTraverseData) => {
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
    }

    const traverse = SchemaUtil2.createCurrentPageTraverse({
      finder: YState.findSnap<V1.Node>,
      callback: traverseTest,
    })

    Surface.disablePointEvent()

    Drag.onStart()
      .onMove(({ marquee }) => {
        this.marquee = StageViewport.toSceneMarquee(marquee)
        this.marqueeOBB = OBB.fromRect(this.marquee)
        this.clearSelect()
        traverse()
      })
      .onDestroy(() => {
        this.marquee = { x: 0, y: 0, width: 0, height: 0 }
        this.afterSelect.dispatch('marquee')

        if (!equal(getSelectIdMap(), this.lastSelectIdMap)) {
          YUndo.track({ type: 'client', description: `选中 ${getSelectIdMap().length} 个节点` })
        }
      })
  }
}

export const StageSelect = makeObservable(new StageSelectService())
