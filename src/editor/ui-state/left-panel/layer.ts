import autobind from 'class-autobind-decorator'
import { OperateMeta } from '~/editor/operate/meta'
import { OperateNode } from '~/editor/operate/node'
import { Record } from '~/editor/record'
import { Schema } from '~/editor/schema/schema'
import { SchemaUtil } from '~/editor/schema/util'
import { StageSelect } from '~/editor/stage/interact/select'
import { createSetting } from '~/global/setting'
import { createSignal } from '~/shared/signal/signal'
import { ceil, floor, max, min } from '../../math/base'
import { ID, INode, INodeParent } from '../../schema/type'
import { UILeftPanel } from './left-panel'

export type ILeftPanelNodeStatus = {
  expanded: boolean
  indent: number
  ancestors: string[]
}

type IAllNodeExpanded = 'expanded' | 'collapsed' | 'partial-expanded'

@autobind
export class UILeftPanelLayerService {
  allPageExpanded = createSetting('LeftPanel.LayerPanel.pagePanelExpanded', true)
  pagePanelHeight = createSignal(200)
  nodeViewHeight = createSignal(0)
  nodeListHeight = createSignal(0)
  nodeScrollHeight = createSignal(0)
  nodeScrollShift = createSignal(0)
  searchSlice = createSignal('')
  nodeIdsInView = createSignal(new Set<string>())
  nodeIdsInSearch = createSignal(new Set<string>())
  singleNodeExpanded = createSignal()
  allNodeExpanded = createSignal(<IAllNodeExpanded>'collapsed')
  afterSearch = createSignal()
  nodeMoveDropDetail = createSignal({ type: <'before' | 'in' | 'after'>'', id: '' })
  nodeMoveStarted = createSignal({ moveId: '' })
  nodeMoveEnded = createSignal()
  enterReName = createSignal<string>()
  needExpandIds = new Set<string>()
  initHook() {
    this.singleNodeExpanded.hook((expanded) => {
      if (expanded === false) return
      if (this.allNodeExpanded.value !== 'collapsed') return
      this.allNodeExpanded.dispatch('partial-expanded')
    })
    this.allNodeExpanded.hook((expanded) => {
      if (expanded === 'partial-expanded') return
      if (expanded === 'expanded') {
        this.setAllNodeStatusExpanded(true)
        this.singleNodeExpanded.dispatch(true)
      }
      if (expanded === 'collapsed') {
        this.setAllNodeStatusExpanded(false)
        this.nodeScrollHeight.value = 0
        this.singleNodeExpanded.dispatch(false)
      }
    })
    StageSelect.afterSelect.hook((type) => {
      this.needExpandIds.forEach((id) => this.setNodeExpanded(id, true))
      if (type !== 'panel') this.autoScroll(OperateNode.selectIds.value)
      this.singleNodeExpanded.dispatch(true)
    })

    this.searchSlice.hook(this.searchNode)
    this.afterSearch.hook(() => {
      this.nodeIdsInSearch.value.forEach((id) => this.setNodeExpanded(id, true))
      this.autoScroll(this.nodeIdsInSearch.value)
      this.singleNodeExpanded.dispatch(true)
    })
    this.singleNodeExpanded.hook(() => {
      this.calcNodeListChange()
    })
    OperateNode.selectIds.hook((selectIds) => {
      if (selectIds.size === 0) this.needExpandIds.clear()
    })
    OperateNode.afterRemoveNodes.hook(() => {
      this.calcNodeListChange()
    })
    OperateNode.afterReHierarchy.hook({ after: 'resetNodeRuntime' }, () => {
      this.calcNodeListChange()
    })
    this.nodeMoveEnded.hook(() => {
      const { moveId } = this.nodeMoveStarted.value
      const { type, id: dropId } = this.nodeMoveDropDetail.value
      if (!moveId || !dropId) {
        return (this.nodeMoveStarted.value.moveId = '')
      }
      Record.startAction()
      const moveNode = Schema.find<INode>(moveId)
      const dropNode = Schema.find<INode>(dropId)
      const oldParent = Schema.find<INodeParent>(moveNode.parentId)
      const newParent = Schema.find<INodeParent>(dropNode.parentId)
      OperateNode.splice(oldParent, moveNode)
      if (type === 'before') SchemaUtil.insertBefore(newParent, moveNode, dropNode)
      if (type === 'in') {
        OperateNode.insertAt(Schema.find(dropId), moveNode, 0)
        this.setNodeExpanded(dropId, true)
      }
      if (type === 'after') SchemaUtil.insertAfter(newParent, moveNode, dropNode)
      Record.endAction('移动节点: ' + moveNode.name)
      this.findNodeInView()
      this.nodeIdsInView.dispatch()
      this.nodeMoveStarted.value.moveId = ''
    })
    this.nodeScrollHeight.intercept((value) => {
      return max(0, min(this.nodeListHeight.value - this.nodeViewHeight.value, value))
    })
    this.nodeScrollHeight.hook(() => {
      this.findNodeInView()
      this.nodeIdsInView.dispatch()
    })
    this.nodeListHeight.hook(() => {
      this.nodeScrollHeight.value = this.nodeScrollHeight.value
    })
    this.nodeViewHeight.hook(() => {
      // if (this.nodeViewHeight.arguments.isInitCause) return
      this.nodeScrollHeight.value = this.nodeScrollHeight.value
      this.findNodeInView()
      this.nodeIdsInView.dispatch()
    })
    this.pagePanelHeight.hook((height) => {
      this.nodeViewHeight.dispatch(UILeftPanel.panelHeight - height - 32)
    })
    OperateMeta.curPage.hook(() => {
      // this.initNodeStatus()
      this.findNodeInView()
      this.nodeIdsInView.dispatch()
    })
  }
  init() {
    // this.nodeViewHeight.arguments.isInitCause = true
    this.nodeViewHeight.dispatch(UILeftPanel.panelHeight - this.pagePanelHeight.value - 32)
  }
  expandAncestor(id: ID) {
    OperateNode.getNodeRuntime(id).ancestors.forEach((parentId) => {
      UILeftPanelLayer.needExpandIds.add(parentId)
    })
  }
  getNodeExpanded(id: string) {
    return OperateNode.getNodeRuntime(id)?.expand
  }
  setNodeExpanded(id: string, expand: boolean) {
    OperateNode.setNodeRuntime(id, { expand: expand })
  }
  private setAllNodeStatusExpanded(expanded: boolean) {
    SchemaUtil.traverseCurPageChildIds(({ id }) => {
      this.setNodeExpanded(id, expanded)
    })
  }
  calcNodeListChange() {
    this.calcNodeListHeight()
    this.findNodeInView()
    this.nodeIdsInView.dispatch()
  }
  calcNodeListHeight() {
    this.nodeListHeight.value = 0
    SchemaUtil.traverseCurPageChildIds(({ id }) => {
      this.nodeListHeight.value += 32
      if (this.getNodeExpanded(id) === false) return false
    })
    this.nodeListHeight.dispatch()
  }
  findNodeInView() {
    this.nodeIdsInView.value.clear()
    let inFrontCount = floor(this.nodeScrollHeight.value / 32)
    let inViewCount = ceil(this.nodeViewHeight.value / 32) + 1
    this.nodeScrollShift.value = this.nodeScrollHeight.value - inFrontCount * 32
    SchemaUtil.traverseCurPageChildIds(({ id, abort }) => {
      if (inFrontCount > 0) inFrontCount--
      else if (inViewCount !== 0) {
        inViewCount--
        this.nodeIdsInView.value.add(id)
      }
      if (inViewCount === 0) return abort.abort()
      if (this.getNodeExpanded(id) === false) return false
    })
  }
  private searchNode() {
    this.nodeIdsInSearch.value.clear()
    if (this.searchSlice.value === '') return this.afterSearch.dispatch()
    SchemaUtil.traverseCurPageChildIds(
      ({ id, node }) => {
        node.name.includes(this.searchSlice.value) && this.nodeIdsInSearch.value.add(id)
      },
      ({ id, upLevelRef }) => {
        if (!this.nodeIdsInSearch.value.has(id) || !upLevelRef?.id) return
        this.setNodeExpanded(upLevelRef.id, true)
      }
    )
    this.afterSearch.dispatch()
  }

  private autoScroll(ids: Set<string>) {
    if (ids.size === 0) return
    this.nodeScrollHeight.value = 0
    SchemaUtil.traverseCurPageChildIds(({ id, abort, upLevelRef }) => {
      if (ids.has(id)) return abort.abort()
      if (!upLevelRef) return (this.nodeScrollHeight.value = this.nodeScrollHeight.value + 32)
      if (this.getNodeExpanded(upLevelRef.id)) {
        this.nodeScrollHeight.value = this.nodeScrollHeight.value + 32
      }
    })
  }
}

export const UILeftPanelLayer = new UILeftPanelLayerService()
