import { inject, injectable } from 'tsyringe'
import { createCache } from '~/shared/cache'
import { When, autobind } from '~/shared/decorator'
import { createSignal } from '~/shared/signal'
import { ceil, floor, max, min } from '../../math/base'
import { SchemaNodeService, injectSchemaNode } from '../../schema/node'
import { INode } from '../../schema/type'
import { SchemaUtilService, injectSchemaUtil } from '../../schema/util'
import { StageSelectService, injectStageSelect } from '../../stage/interact/select'
import { UILeftPanelService, injectUILeftPanel } from './left-panel'

export type ILeftPanelNodeStatus = {
  expanded: boolean
  indent: number
  ancestors: string[]
}

type IAllNodeExpanded = 'expanded' | 'collapsed' | 'partial-expanded'

@autobind
@injectable()
export class UILeftPanelLayerService {
  nodeStatusCache = createCache<ILeftPanelNodeStatus>()
  allPageExpanded = createSignal(true)
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
  constructor(
    @injectUILeftPanel private UILeftPanel: UILeftPanelService,
    @injectSchemaUtil private SchemaUtil: SchemaUtilService,
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectStageSelect private StageSelect: StageSelectService
  ) {
    this.initialize()
  }
  @When('SchemaNode.initialized')
  private initialize() {
    this.initNodeStatus()
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
    this.StageSelect.afterSelect.hook((type) => {
      this.StageSelect.needExpandIds.forEach((id) => this.setNodeExpanded(id, true))
      if (type !== 'panel') this.autoScroll(this.SchemaNode.selectIds.value)
      this.singleNodeExpanded.dispatch(true)
    })
    this.searchSlice.hook(this.searchNode)
    this.afterSearch.hook(() => {
      this.nodeIdsInSearch.value.forEach((id) => this.setNodeExpanded(id, true))
      this.autoScroll(this.nodeIdsInSearch.value)
      this.singleNodeExpanded.dispatch(true)
    })
    this.singleNodeExpanded.hook(this.calcNodeListChange)
    this.SchemaNode.beforeDelete.hook(this.calcNodeListChange)
    this.SchemaNode.afterConnect.hook(({ id: currentId }) => {
      this.SchemaUtil.traverseFromSomeId(currentId, ({ id, upLevelRef }) => {
        const parentId = upLevelRef?.id ?? ''
        const indent = (this.getNodeStatus(parentId)?.indent ?? -1) + 1
        const ancestors = this.getNodeStatus(parentId)?.ancestors ?? []
        this.setNodeStatus(id, { indent, ancestors: [...ancestors, parentId] })
      })
      this.calcNodeListChange()
    })
    this.nodeMoveEnded.hook(() => {
      if (!this.nodeMoveDropDetail.value) return
      const { moveId } = this.nodeMoveStarted.value
      const { type, id: dropId } = this.nodeMoveDropDetail.value
      const node = this.SchemaNode.find(moveId)
      let parent = this.SchemaUtil.findParent(dropId)
      if (parent) {
        this.SchemaNode.disconnect(parent, node)
        if (type === 'before') this.SchemaUtil.insertBefore(parent, node, dropId)
        if (type === 'in') {
          ;(parent as INode) = this.SchemaNode.find(dropId)
          this.SchemaNode.connectAt(parent, node, 0)
          this.setNodeExpanded(dropId, true)
        }
        if (type === 'after') this.SchemaUtil.insertAfter(parent, node, dropId)
        this.findNodeInView()
        this.nodeIdsInView.dispatch()
      }
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
    this.UILeftPanel.panelHeight.hook((panelHeight) => {
      this.nodeViewHeight.dispatch(panelHeight - this.pagePanelHeight.value - 32)
    })
    this.pagePanelHeight.hook((height) => {
      this.nodeViewHeight.dispatch(this.UILeftPanel.panelHeight.value - height - 32)
    })
    this.nodeViewHeight.dispatch(
      this.UILeftPanel.panelHeight.value - this.pagePanelHeight.value - 32
    )
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
    this.SchemaUtil.traverse(({ id }) => {
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
    this.SchemaUtil.traverse(({ id, abort }) => {
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
    this.SchemaUtil.traverse(
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
    this.SchemaUtil.traverse(({ id, depth, ancestors }) => {
      this.nodeStatusCache.set(id, { expanded: false, indent: depth, ancestors })
    })
  }
  private setAllNodeStatusExpanded(expanded: boolean) {
    this.SchemaUtil.traverse(({ id }) => {
      this.setNodeExpanded(id, expanded)
    })
  }
  private autoScroll(ids: Set<string>) {
    if (ids.size === 0) return
    this.nodeScrollHeight.value = 0
    this.SchemaUtil.traverse(({ id, abort, upLevelRef }) => {
      if (ids.has(id)) return abort.abort()
      if (!upLevelRef) return (this.nodeScrollHeight.value = this.nodeScrollHeight.value + 32)
      if (this.getNodeExpanded(upLevelRef.id)) {
        this.nodeScrollHeight.value = this.nodeScrollHeight.value + 32
      }
    })
  }
}

export const injectUILeftPanelLayer = inject(UILeftPanelLayerService)
