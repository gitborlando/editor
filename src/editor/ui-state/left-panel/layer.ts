import { createObjCache } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'
import equal from 'fast-deep-equal'
import { OperateNode } from 'src/editor/operate/node'
import { SchemaHistory } from 'src/editor/schema/history'
import { Schema } from 'src/editor/schema/schema'
import { SchemaUtil2 } from 'src/editor/schema/utils'
import { StageSelect } from 'src/editor/stage/interact/select'
import { createStorageItem } from 'src/global/storage'
import { SchemaUtil } from 'src/shared/utils/schema'
import { ceil, floor } from '../../math/base'
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
  pagePanelHeight = Signal.create(200)
  nodeViewHeight = Signal.create(0)
  nodeListHeight = Signal.create(0)
  nodeScrollHeight = Signal.create(0)
  nodeScrollShift = Signal.create(0)
  searchSlice = Signal.create('')
  inViewNodeInfo = Signal.create(new Set<INodeInfo>())
  nodeIdsInSearch = Signal.create(new Set<string>())
  singleNodeExpanded = Signal.create()
  allNodeExpanded = Signal.create(<IAllNodeExpanded>'collapsed')
  afterSearch = Signal.create()
  nodeMoveDropDetail = Signal.create({ type: <'before' | 'in' | 'after'>'', id: '' })
  nodeMoveStarted = Signal.create({ moveId: '' })
  nodeMoveEnded = Signal.create()
  enterReName = Signal.create<string>()
  needExpandIds = new Set<string>()
  private lastInViewIds = <ID[]>[]
  private nodeExpandCache = createObjCache<boolean>()
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
      this.needExpandIds.forEach((id) => this.nodeExpandCache.set(id, true))
      if (type !== 'panel') this.autoScroll(OperateNode.selectIds.value)
      this.singleNodeExpanded.dispatch(true)
    })
    this.searchSlice.hook(this.searchNode)
    this.afterSearch.hook(() => {
      this.nodeIdsInSearch.value.forEach((id) =>
        this.setSingleNodeExpanded(id, true),
      )
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
    // this.nodeScrollHeight.intercept((value) => {
    //   return max(0, min(this.nodeListHeight.value - this.nodeViewHeight.value, value))
    // })
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
    Schema.onMatchPatch('/?/childIds/...', () => {
      this.calcNodeListChange()
    })
  }
  init() {
    this.nodeViewHeight.dispatch(
      UILeftPanel.panelHeight - this.pagePanelHeight.value - 32,
    )
  }
  expandAncestor(id: ID) {
    let node: INode = Schema.find(id)
    while (node) {
      this.needExpandIds.add(node.parentId)
      node = Schema.find(node.parentId)
    }
  }
  getNodeExpanded(id: string) {
    return this.nodeExpandCache.getSet(id, () => true)
  }
  setSingleNodeExpanded(id: string, expand: boolean) {
    this.nodeExpandCache.set(id, expand)
    this.calcNodeListChange()
  }
  private setAllNodeStatusExpanded(expand: boolean) {
    SchemaUtil.traverseCurPageChildIds(({ id }) => {
      this.nodeExpandCache.set(id, expand)
    })
    this.calcNodeListChange()
  }
  calcNodeListChange() {
    this.nodeListHeight.value = 0
    let inViewNodeInfo = <INodeInfo[]>[]
    let inFrontCount = floor(this.nodeScrollHeight.value / 32)
    let inViewCount = ceil(this.nodeViewHeight.value / 32) + 1
    this.nodeScrollShift.value = this.nodeScrollHeight.value - inFrontCount * 32
    const traverse = SchemaUtil2.createCurrentPageTraverse({
      finder: YState.findSnap<V1.Node>,
      callback: ({ id, ancestors, depth }) => {
        this.nodeListHeight.value += 32
        if (inFrontCount > 0) {
          inFrontCount--
        } else if (inViewCount !== 0) {
          inViewCount--
          inViewNodeInfo.push({ id, indent: depth, ancestors })
        }
        if (this.getNodeExpanded(id) === false) return false
      },
    })
    traverse()
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

    const traverse = SchemaUtil2.createCurrentPageTraverse({
      finder: YState.findSnap<V1.Node>,
      callback: ({ id, node }) => {
        node.name.includes(this.searchSlice.value) &&
          this.nodeIdsInSearch.value.add(id)
      },
      bubbleCallback: ({ id, upLevelRef }) => {
        if (!this.nodeIdsInSearch.value.has(id) || !upLevelRef?.id) return
        this.setSingleNodeExpanded(upLevelRef.id, true)
      },
    })
    traverse()
    this.afterSearch.dispatch()
  }
  private autoScroll(ids: Set<string>) {
    if (ids.size === 0) return
    this.nodeScrollHeight.value = 0
    const traverse = SchemaUtil2.createCurrentPageTraverse({
      finder: YState.findSnap<V1.Node>,
      callback: ({ id, abort, upLevelRef }) => {
        if (ids.has(id)) return abort.abort()
        if (!upLevelRef)
          return (this.nodeScrollHeight.value = this.nodeScrollHeight.value + 32)
        if (this.getNodeExpanded(upLevelRef.id)) {
          this.nodeScrollHeight.value = this.nodeScrollHeight.value + 32
        }
      },
    })
    traverse()
    this.nodeScrollHeight.dispatch()
  }
}

export const UILeftPanelLayer = new UILeftPanelLayerService()
