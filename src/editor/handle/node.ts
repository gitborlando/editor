import { firstOne, miniId, stableIndex } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'
import { AABB, OBB } from 'src/editor/math/obb'
import { SchemaHelper } from 'src/editor/schema/helper'
import { StageSelect } from 'src/editor/stage/interact/select'
import { getSelectIds as getSelectIdList } from 'src/editor/y-state/y-clients'
import { clone } from 'src/shared/utils/normal'
import { SchemaUtil } from 'src/shared/utils/schema'
import { xy_ } from '../math/xy'
import { SchemaCreator } from '../schema/creator'
import { Schema } from '../schema/schema'
import { ID, INode, INodeParent } from '../schema/type'

@autobind
class HandleNodeService {
  datumId = ''
  @observable.ref datumXY = xy_(0, 0)
  afterRemoveNodes = Signal.create<ID[]>()
  intoEditNodeId = Signal.create('')

  private copyIds = <ID[]>[]

  init() {
    StageSelect.afterSelect.hook(() => this.getDatum())
  }

  addNodes(nodes: INode[]) {
    nodes.forEach((node) => YState.set(`${node.id}`, node))
  }

  removeNodes(nodes: INode[]) {
    nodes.forEach((node) => YState.delete(`${node.id}`))
  }

  insertChildAt(parent: INodeParent, node: INode, index?: number) {
    index ??= parent.childIds.length
    YState.insert(`${parent.id}.childIds.${index}`, node.id)
    YState.set(`${node.id}.parentId`, parent.id)
  }

  removeChild(parent: INodeParent, node: INode) {
    const index = parent.childIds.indexOf(node.id)
    YState.delete(`${parent.id}.childIds.${index}`)
    YState.set(`${node.id}.parentId`, '')
  }

  deleteChild(parent: INodeParent, node: INode) {
    const index = parent.childIds.indexOf(node.id)
    YState.delete(`${parent.id}.childIds.${index}`)
    YState.delete(`${node.id}`)
  }

  reHierarchy(parent: INodeParent, node: INode, index: number) {
    index = stableIndex(parent.childIds, index)
    const oldIndex = parent.childIds.indexOf(node.id)
    YState.delete(`${parent.id}.childIds.${oldIndex}`)
    YState.insert(`${parent.id}.childIds.${index}`, node.id)
  }

  getNodesMergedOBB(nodes: INode[]) {
    const aabbList = nodes.map((node) => OBB.FromRect(node, node.rotation).aabb)
    return OBB.FromAABB(AABB.Merge(aabbList))
  }

  getNodeCenterXY(node: INode) {
    return OBB.FromRect(node, node.rotation).center
  }

  deleteSelectedNodes() {
    const traverse = (id: ID, parent?: INodeParent) => {
      const node = YState.find<INode>(id)
      if (!parent) parent = YState.find<INodeParent>(node.parentId)
      if (SchemaHelper.isNodeParent(node)) {
        const childIds = node.childIds.slice()
        childIds.forEach((id) => traverse(id, node))
      }
      this.deleteChild(parent, node)
    }
    getSelectIdList().forEach((id) => traverse(id))

    YClients.clearSelect()
    YClients.afterSelect$.dispatch()

    YState.next()
    YUndo.track({ type: 'all', description: '删除节点' })
  }

  copySelectedNodes() {
    this.copyIds = getSelectIdList()
  }

  pasteNodes() {
    if (!this.copyIds.length) return

    const newSelectIds = <ID[]>[]
    const cloneNodes = (oldNode: INode) => {
      const newNode = clone(oldNode)
      newNode.id = miniId()
      newNode.name = SchemaCreator.createNodeName(oldNode.type).name
      if ('childIds' in newNode) newNode.childIds = []
      return newNode
    }
    SchemaUtil.traverseIds(this.copyIds, (props) => {
      const { node, parent, depth, upLevelRef } = props
      const newNode = cloneNodes(node)
      const newParent = upLevelRef?.newNode || parent
      this.addNodes([newNode])
      this.insertAt(newParent, newNode)
      props.newNode = newNode
      if (depth === 0) newSelectIds.push(newNode.id)
    })
  }

  paste() {
    this.pasteNodes()
    this.copyIds = []
    Schema.nextSchema()
    Schema.commitHistory('粘贴节点')
  }

  wrapInFrame() {
    const selected = getSelectIdList().map(YState.find<INode>)
    if (selected.length === 0) return

    const frameOBB = this.getNodesMergedOBB(selected)
    const frameNode = SchemaCreator.frame({ ...frameOBB })
    const oldParent = YState.find<INodeParent>(selected[0].parentId)
    const index = oldParent.childIds.indexOf(selected[0].id)

    this.addNodes([frameNode])
    this.insertChildAt(oldParent, frameNode, index)
    selected.forEach((node) => this.removeChild(oldParent, node))
    selected.forEach((node) => this.insertChildAt(frameNode, node))

    YState.next()
    YUndo.untrack(
      action(() => {
        selected.forEach((node) => YClients.unSelect(node.id))
        YClients.select(frameNode.id)
      }),
    )
    YUndo.track({ type: 'all', description: '将节点包裹在画板中' })
  }

  private getDatum() {
    const selectIds = getSelectIdList()

    if (selectIds.length === 0) {
      this.datumId = ''
    }
    if (selectIds.length === 1) {
      this.datumId = Schema.find<INode>(firstOne(selectIds)!).parentId
    }
    if (selectIds.length > 1) {
      const parentIds = new Set<string>()
      selectIds.forEach((id) => parentIds.add(Schema.find<INode>(id).parentId))
      if (parentIds.size === 1) this.datumId = firstOne(parentIds)!
      if (parentIds.size > 1) this.datumId = ''
    }

    const datum = YState.find<V1.Node>(this.datumId)
    if (datum && !SchemaHelper.isPageById(datum.id)) {
      const aabb = OBB.FromRect(datum, datum.rotation).aabb
      this.datumXY = XY._(aabb.minX, aabb.minY)
    } else {
      this.datumXY = XY._(0, 0)
    }
  }
}

export const HandleNode = makeObservable(new HandleNodeService())
