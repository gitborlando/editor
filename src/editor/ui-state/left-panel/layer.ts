import autobind from 'class-autobind-decorator'
import { Record } from '~/editor/record'
import { SchemaNode } from '~/editor/schema/node'
import { SchemaPage } from '~/editor/schema/page'
import { SchemaUtil } from '~/editor/schema/util'
import { StageSelect } from '~/editor/stage/interact/select'
import { createSetting } from '~/global/setting'
import { createCache } from '~/shared/cache'
import { createSignal } from '~/shared/signal'
import { ceil, floor, max, min } from '../../math/base'
import { INode } from '../../schema/type'
import { UILeftPanel } from './left-panel'

export type ILeftPanelNodeStatus = {
  expanded: boolean
  indent: number
  ancestors: string[]
}

type IAllNodeExpanded = 'expanded' | 'collapsed' | 'partial-expanded'

@autobind
export class UILeftPanelLayerService {
  nodeStatusCache = createCache<ILeftPanelNodeStatus>()
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
      StageSelect.needExpandIds.forEach((id) => this.setNodeExpanded(id, true))
      if (type !== 'panel') this.autoScroll(SchemaNode.selectIds.value)
      this.singleNodeExpanded.dispatch(true)
    })
    this.searchSlice.hook(this.searchNode)
    this.afterSearch.hook(() => {
      this.nodeIdsInSearch.value.forEach((id) => this.setNodeExpanded(id, true))
      this.autoScroll(this.nodeIdsInSearch.value)
      this.singleNodeExpanded.dispatch(true)
    })
    this.singleNodeExpanded.hook(this.calcNodeListChange)
    SchemaNode.afterDelete.hook(this.calcNodeListChange)
    SchemaNode.afterConnect.hook(({ node }) => {
      SchemaUtil.traverseFromSomeId(node.id, ({ id, upLevelRef }) => {
        const parentId = upLevelRef?.id ?? ''
        const indent = (this.getNodeStatus(parentId)?.indent ?? -1) + 1
        const ancestors = this.getNodeStatus(parentId)?.ancestors ?? []
        this.setNodeStatus(id, { indent, ancestors: [...ancestors, parentId] })
      })
      this.calcNodeListChange()
    })
    this.nodeMoveEnded.hook(() => {
      const { moveId } = this.nodeMoveStarted.value
      const { type, id: dropId } = this.nodeMoveDropDetail.value
      if (!moveId || !dropId) {
        return (this.nodeMoveStarted.value.moveId = '')
      }
      Record.startAction()
      const moveNode = SchemaNode.find(moveId)
      const dropNode = SchemaNode.find(dropId)
      let newParent = SchemaUtil.findParent(dropId)!
      const oldParent = SchemaUtil.findParent(moveNode.id)!
      SchemaNode.disconnect(oldParent, moveNode)
      if (type === 'before') SchemaUtil.insertBefore(newParent, moveNode, dropNode)
      if (type === 'in') {
        ;(newParent as INode) = SchemaNode.find(dropId)
        SchemaNode.connectAt(newParent, moveNode, 0)
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
      this.nodeScrollHeight.value = this.nodeScrollHeight.value
      this.findNodeInView()
      this.nodeIdsInView.dispatch()
    })
    this.pagePanelHeight.hook((height) => {
      this.nodeViewHeight.dispatch(UILeftPanel.panelHeight - height - 32)
    })
    SchemaPage.currentId.hook(() => {
      this.findNodeInView()
      this.nodeIdsInView.dispatch()
    })
  }
  init() {
    this.initNodeStatus()
    this.nodeViewHeight.dispatch(UILeftPanel.panelHeight - this.pagePanelHeight.value - 32)
  }
  getNodeStatus(id: string): ILeftPanelNodeStatus | undefined {
    return this.nodeStatusCache.get(id)
  }
  setNodeStatus(id: string, status: Partial<ILeftPanelNodeStatus>) {
    const lastStatus = this.getNodeStatus(id) || <ILeftPanelNodeStatus>{}
    this.nodeStatusCache.set(id, { ...lastStatus, ...status })
  }
  getNodeExpanded(id: string) {
    return this.nodeStatusCache.get(id).expanded
  }
  setNodeExpanded(id: string, expanded: boolean) {
    const nodeStatus = this.nodeStatusCache.get(id)
    this.nodeStatusCache.set(id, { ...nodeStatus, expanded })
  }
  calcNodeListChange() {
    this.calcNodeListHeight()
    this.findNodeInView()
    this.nodeIdsInView.dispatch()
  }
  calcNodeListHeight() {
    this.nodeListHeight.value = 0
    SchemaUtil.traverse(({ id }) => {
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
    SchemaUtil.traverse(({ id, abort }) => {
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
    SchemaUtil.traverse(
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
  private initNodeStatus() {
    SchemaUtil.traverse(({ id, depth, ancestors }) => {
      this.nodeStatusCache.set(id, { expanded: false, indent: depth, ancestors })
    })
  }
  private setAllNodeStatusExpanded(expanded: boolean) {
    SchemaUtil.traverse(({ id }) => {
      this.setNodeExpanded(id, expanded)
    })
  }
  private autoScroll(ids: Set<string>) {
    if (ids.size === 0) return
    this.nodeScrollHeight.value = 0
    SchemaUtil.traverse(({ id, abort, upLevelRef }) => {
      if (ids.has(id)) return abort.abort()
      if (!upLevelRef) return (this.nodeScrollHeight.value = this.nodeScrollHeight.value + 32)
      if (this.getNodeExpanded(upLevelRef.id)) {
        this.nodeScrollHeight.value = this.nodeScrollHeight.value + 32
      }
    })
  }
}

export const UILeftPanelLayer = new UILeftPanelLayerService()
