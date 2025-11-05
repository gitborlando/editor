import { AABB, OBB } from '@gitborlando/geo'
import { firstOne, objKeys } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'
import equal from 'fast-deep-equal'
import hotkeys from 'hotkeys-js'
import { observable } from 'mobx'
import { EditorCommand } from 'src/editor/editor/command'
import { OperateNode } from 'src/editor/operate/node'
import { OperateText } from 'src/editor/operate/text'
import { SchemaHelper, SchemaUtilTraverseData } from 'src/editor/schema/helper'
import { Schema } from 'src/editor/schema/schema'
import { ID, IFrame, INode } from 'src/editor/schema/type'
import { ElemMouseEvent } from 'src/editor/stage/render/elem'
import { StageScene } from 'src/editor/stage/render/scene'
import { Surface } from 'src/editor/stage/render/surface'
import { StageViewport } from 'src/editor/stage/viewport'
import { getSelectIdMap, YClients } from 'src/editor/y-state/y-clients'
import { ContextMenu } from 'src/global/context-menu'
import { Drag } from 'src/global/event/drag'
import { macroMatch, type IRect } from 'src/shared/utils/normal'
import { SchemaUtil } from 'src/shared/utils/schema'
import { collectDisposer } from 'src/utils/disposer'
import { moveTransformer } from 'src/view/editor/stage/transform'

type ISelectType = 'panel' | 'create' | 'stage-single' | 'marquee'

@autobind
class StageSelectService {
  @observable marquee: IRect = { x: 0, y: 0, width: 0, height: 0 }
  @observable hoverId?: string

  private marqueeOBB?: OBB
  private lastSelectIdMap = <Record<string, boolean>>{}

  afterSelect = Signal.create<ISelectType>()

  startInteract() {
    return collectDisposer(
      StageScene.sceneRoot.addEvent('mousedown', this.onSceneRootMouseDown),
      Surface.addEvent('dblclick', this.onDoubleClick),
      Surface.addEvent('mousemove', this.onHover),
      Surface.addEvent('contextmenu', this.onContextMenu),
    )
  }

  private onHover(e: MouseEvent) {
    const hovered = firstOne(StageScene.elemsFromPoint(XY.client(e)))
    this.hoverId = hovered?.id
  }

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

  private onSceneRootMouseDown(e: ElemMouseEvent) {
    this.lastSelectIdMap = getSelectIdMap()

    if (!this.hoverId || SchemaHelper.isFirstLayerFrame(this.hoverId)) {
      this.clearSelect()
      this.onMarqueeSelect()
      return
    }

    this.onMousedownSelect()
    moveTransformer(e)
  }

  private onContextMenu(e: MouseEvent) {
    if (this.hoverId) this.onMousedownSelect()

    const { copyPasteGroup, undoRedoGroup, nodeGroup, nodeReHierarchyGroup } =
      EditorCommand
    if (getSelectIdMap().length || this.hoverId) {
      const menuOptions = [
        copyPasteGroup,
        undoRedoGroup,
        nodeGroup,
        nodeReHierarchyGroup,
      ]
      ContextMenu.menus = menuOptions
      ContextMenu.openMenu(e as any)
      return
    }
    ContextMenu.menus = [undoRedoGroup]
    ContextMenu.openMenu(e as any)
  }

  private clearSelect() {
    if (hotkeys.shift) return
    YClients.clearSelect()
  }

  onPanelSelect(id: string) {
    if (getSelectIdMap()[id]) return

    this.clearSelect()
    YUndo.untrack(() => YClients.select(id))
    YUndo.track({ type: 'client', description: `通过面板选中节点 ${id}` })
    this.afterSelect.dispatch('panel')
  }

  onCreateSelect(id: string) {
    this.clearSelect()
    OperateNode.select(id)
    // UILeftPanelLayer.expandAncestor(id)
    this.afterSelect.dispatch('create')
    OperateNode.commitSelect()
  }

  private onMousedownSelect() {
    this.onSelect(this.hoverId!)
    this.afterSelect.dispatch('stage-single')
  }

  private onSelect(id: ID) {
    if (getSelectIdMap()[id]) return
    if (SchemaHelper.isFirstLayerFrame(id)) return

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

  private onDeepSelect() {
    const hoverNode = Schema.find(this.hoverId!)
    if (hoverNode?.type !== 'text') return
    OperateText.intoEditing.dispatch(hoverNode.id)
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
          YUndo.untrack(() => YClients.select(id))
          // UILeftPanelLayer.needExpandIds.add(id)
          return false
        }
        return
      }
      if (hitTest(this.marqueeOBB, elem.obb)) {
        YUndo.untrack(() => YClients.select(id))
        // UILeftPanelLayer.needExpandIds.add(node.parentId)
        return
      }
      return false
    }

    const traverse = SchemaHelper.createCurrentPageTraverse({
      callback: traverseTest,
    })

    Surface.disablePointEvent()

    Drag.onStart()
      .onMove(({ marquee }) => {
        this.marquee = StageViewport.toSceneMarquee(marquee)
        this.marqueeOBB = OBB.fromRect(this.marquee)
        this.clearSelect()
        runInAction(() => traverse())
      })
      .onDestroy(() => {
        this.marquee = { x: 0, y: 0, width: 0, height: 0 }
        this.afterSelect.dispatch('marquee')

        if (!equal(getSelectIdMap(), this.lastSelectIdMap)) {
          YUndo.track({
            type: 'client',
            description: `选中 ${objKeys(getSelectIdMap()).length} 个节点`,
          })
        }
      })
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
}

export const StageSelect = makeObservable(new StageSelectService())
