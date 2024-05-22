import autobind from 'class-autobind-decorator'
import equal from 'fast-deep-equal'
import { OperateNode } from '~/editor/operate/node'
import { SchemaHistory } from '~/editor/schema/history'
import { Schema } from '~/editor/schema/schema'
import { StageSelect } from '~/editor/stage/interact/select'
import { createStorageItem } from '~/global/storage'
import { createSignal } from '~/shared/signal/signal'
import { SchemaUtil } from '~/shared/utils/schema'
import { ceil, floor, max, min } from '../../math/base'
import { ID, INode, INodeParent } from '../../schema/type'
import { UILeftPanel } from './left-panel'

export type INodeInfo = {
  id: ID
  indent: number
  ancestors: string[]
}

type IAllNodeExpanded = 'expanded' | 'collapsed' | 'partial-expanded'

@autobind
class UILeftPanelLayerService {
  allPageExpanded = createStorageItem('LeftPanel.LayerPanel.pagePanelExpanded', true)
  pagePanelHeight = createSignal(200)
  nodeViewHeight = createSignal(0)
  nodeListHeight = createSignal(0)
  nodeScrollHeight = createSignal(0)
  nodeScrollShift = createSignal(0)
  searchSlice = createSignal('')
  inViewNodeInfo = createSignal(new Set<INodeInfo>())
  nodeIdsInSearch = createSignal(new Set<string>())
  singleNodeExpanded = createSignal()
  allNodeExpanded = createSignal(<IAllNodeExpanded>'collapsed')
  afterSearch = createSignal()
  nodeMoveDropDetail = createSignal({ type: <'before' | 'in' | 'after'>'', id: '' })
  nodeMoveStarted = createSignal({ moveId: '' })
  nodeMoveEnded = createSignal()
  enterReName = createSignal<string>()
  needExpandIds = new Set<string>()
  private lastInViewIds = <ID[]>[]
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
      this.needExpandIds.forEach((id) => OperateNode.setNodeRuntime(id, { expand: true }))
      if (type !== 'panel') this.autoScroll(OperateNode.selectIds.value)
      this.singleNodeExpanded.dispatch(true)
    })
    this.searchSlice.hook(this.searchNode)
    this.afterSearch.hook(() => {
      this.nodeIdsInSearch.value.forEach((id) => this.setSingleNodeExpanded(id, true))
      this.autoScroll(this.nodeIdsInSearch.value)
      this.singleNodeExpanded.dispatch(true)
    })
    OperateNode.selectIds.hook((selectIds) => {
      if (selectIds.size === 0) this.needExpandIds.clear()
    })
    this.nodeMoveEnded.hook(() => {
      const { moveId } = this.nodeMoveStarted.value
      const { type, id: dropId } = this.nodeMoveDropDetail.value
      if (!moveId || !dropId) {
        return (this.nodeMoveStarted.value.moveId = '')
      }
      const moveNode = Schema.find<INode>(moveId)
      const dropNode = Schema.find<INode>(dropId)
      const oldParent = Schema.find<INodeParent>(moveNode.parentId)
      const newParent = Schema.find<INodeParent>(dropNode.parentId)
      OperateNode.splice(oldParent, moveNode)
      if (type === 'before') {
        let index = newParent.childIds.indexOf(dropId)
        OperateNode.insertAt(newParent, moveNode, index)
      } else if (type === 'in') {
        OperateNode.insertAt(Schema.find(dropId), moveNode, 0)
        this.setSingleNodeExpanded(dropId, true)
      } else if (type === 'after') {
        let index = newParent.childIds.indexOf(dropId)
        OperateNode.insertAt(newParent, moveNode, index + 1)
      }
      SchemaHistory.commit('move node')
      this.calcNodeListChange()
      this.nodeMoveStarted.value.moveId = ''
    })
    this.nodeScrollHeight.intercept((value) => {
      return max(0, min(this.nodeListHeight.value - this.nodeViewHeight.value, value))
    })
    this.nodeScrollHeight.hook(() => {
      this.calcNodeListChange()
    })
    this.nodeListHeight.hook(() => {
      this.nodeScrollHeight.value = this.nodeScrollHeight.value
    })
    this.nodeViewHeight.hook(() => {
      this.nodeScrollHeight.value = this.nodeScrollHeight.value
      this.calcNodeListChange()
    })
    this.pagePanelHeight.hook((height) => {
      this.nodeViewHeight.dispatch(UILeftPanel.panelHeight - height - 32)
    })
    Schema.inited.hook(() => {
      this.calcNodeListChange()
    })
    Schema.onMatchPatch('/client/selectPageId', () => {
      this.calcNodeListChange()
    })
  }
  init() {
    this.nodeViewHeight.dispatch(UILeftPanel.panelHeight - this.pagePanelHeight.value - 32)
  }
  expandAncestor(id: ID) {
    let node: INode = Schema.find(id)
    while (node) {
      this.needExpandIds.add(node.parentId)
      node = Schema.find(node.parentId)
    }
  }
  private getNodeExpanded(id: string) {
    return OperateNode.getNodeRuntime(id)?.expand
  }
  setSingleNodeExpanded(id: string, expand: boolean) {
    OperateNode.setNodeRuntime(id, { expand: expand })
    this.calcNodeListChange()
  }
  private setAllNodeStatusExpanded(expand: boolean) {
    SchemaUtil.traverseCurPageChildIds(({ id }) => {
      OperateNode.setNodeRuntime(id, { expand })
    })
    this.calcNodeListChange()
  }
  calcNodeListChange() {
    this.nodeListHeight.value = 0
    let inViewNodeInfo = <INodeInfo[]>[]
    let inFrontCount = floor(this.nodeScrollHeight.value / 32)
    let inViewCount = ceil(this.nodeViewHeight.value / 32) + 1
    this.nodeScrollShift.value = this.nodeScrollHeight.value - inFrontCount * 32
    SchemaUtil.traverseCurPageChildIds(({ id, ancestors, depth }) => {
      this.nodeListHeight.value += 32
      if (inFrontCount > 0) {
        inFrontCount--
      } else if (inViewCount !== 0) {
        inViewCount--
        inViewNodeInfo.push({ id, indent: depth, ancestors })
      }
      if (this.getNodeExpanded(id) === false) return false
    })
    const thisInViewIds = inViewNodeInfo.map((info) => info.id)
    if (!equal(this.lastInViewIds, thisInViewIds)) {
      this.lastInViewIds = thisInViewIds
      this.inViewNodeInfo.dispatch(new Set(inViewNodeInfo))
    }
    this.nodeListHeight.dispatch()
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
        this.setSingleNodeExpanded(upLevelRef.id, true)
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
    this.nodeScrollHeight.dispatch()
  }
}

export const UILeftPanelLayer = new UILeftPanelLayerService()
