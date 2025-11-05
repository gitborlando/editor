import { firstOne, iife, stableIndex } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'
import { AABB, OBB } from 'src/editor/math/obb'
import { SchemaHelper } from 'src/editor/schema/helper'
import { getSelectIdList } from 'src/editor/y-state/y-clients'
import { collectDisposer } from 'src/utils/disposer'
import { xy_ } from '../math/xy'
import { SchemaCreator } from '../schema/creator'
import { Schema } from '../schema/schema'
import { ID, INode, INodeParent } from '../schema/type'

@autobind
class HandleNodeService {
  datumId = ''
  @observable.ref datumXY = xy_(0, 0)
  copiedIds = <ID[]>[]

  init() {
    return collectDisposer(YClients.afterSelect$.hook(() => this.getDatum()))
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
    const traverse = SchemaHelper.createTraverse({
      bubbleCallback: ({ node, parent }) => this.deleteChild(parent, node),
    })
    traverse(getSelectIdList())

    YClients.clearSelect()
    YClients.afterSelect$.dispatch()

    YState.next()
    YUndo.track({ type: 'all', description: '删除节点' })
  }

  copySelectedNodes() {
    this.copiedIds = getSelectIdList()
  }

  pasteNodes() {
    if (!this.copiedIds.length) return

    const newSelectIds = <ID[]>[]
    const traverse = SchemaHelper.createTraverse({
      callback: (props) => {
        const { node, parent, upLevelRef, depth } = props
        const newParent = upLevelRef?.newNode || parent
        const newNode = SchemaCreator.clone(node)
        this.addNodes([newNode])
        this.insertChildAt(newParent, newNode)
        props.newNode = newNode
        if (depth === 0) newSelectIds.push(newNode.id)
      },
    })
    traverse(this.copiedIds)
    this.copiedIds = []

    YState.next()
    YUndo.untrack(() => newSelectIds.forEach((id) => YClients.select(id)))
    YUndo.track({
      type: 'all',
      description: `粘贴 ${newSelectIds.length} 个节点`,
    })
  }

  reHierarchySelectedNode(type: 'up' | 'down' | 'top' | 'bottom') {
    const selected = getSelectIdList().map(YState.find<INode>)

    selected.forEach((node) => {
      const parent = YState.find<INodeParent>(node.parentId)
      let index = parent.childIds.indexOf(node.id)
      index = iife(() => {
        if (type === 'up') return index - 1
        if (type === 'down') return index + 1
        if (type === 'top') return 0
        return parent.childIds.length - 1
      })
      this.reHierarchy(parent, node, index)
    })

    YState.next()
    YUndo.track({ type: 'all', description: '重新排序' })
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
