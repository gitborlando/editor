import autobind from 'class-autobind-decorator'
import { createSignal } from '~/shared/signal/signal'
import { OBB } from '../math/obb'
import { SchemaHistory } from '../schema/history'
import { Schema } from '../schema/schema'
import { INode, INodeParent } from '../schema/type'
import { SchemaUtil } from '../schema/util'
import { StageDraw } from '../stage/draw/draw'
import { StageElement } from '../stage/element'
import { StageSelect } from '../stage/interact/select'
import { StageWidgetTransform } from '../stage/widget/transform'
import { OperateNode } from './node'

const alignTypes = <const>[
  'alignLeft',
  'alignCenter',
  'alignRight',
  'verticalTop',
  'verticalCenter',
  'verticalBottom',
]

export type IAlignType = (typeof alignTypes)[number]

@autobind
class OperateAlignService {
  alignTypes = alignTypes
  canAlign = createSignal(false)
  currentAlign = createSignal<IAlignType>()
  afterAlign = createSignal()
  private needAlign = false
  private toAlignNodes = <INode[]>[]
  initHook() {
    StageSelect.afterSelect.hook(this.setupAlign)
    this.currentAlign.hook(this.autoAlign)
    Schema.registerListener('changeNodeAlign', ({ changeIds }) => {
      SchemaUtil.traverseIds(changeIds, ({ id, depth }) => {
        if (depth > 1) return false
        StageElement.setupOBB(id)
        StageDraw.collectRedraw(id)
      })
    })
  }
  private setupAlign() {
    const { selectNodes } = OperateNode
    if (selectNodes.length === 0) {
      this.canAlign.dispatch(false)
    }
    if (selectNodes.length > 1) {
      this.toAlignNodes = [...selectNodes]
      this.canAlign.dispatch(true)
    }
    if (selectNodes.length === 1 && SchemaUtil.isById(selectNodes[0].id, 'nodeParent')) {
      this.toAlignNodes = SchemaUtil.getChildren(<INodeParent>selectNodes[0])
      this.canAlign.dispatch(true)
    }
  }
  private autoAlign() {
    this[this.currentAlign.value]()
    if (this.needAlign) {
      const changedIds = this.toAlignNodes.map((node) => node.id)
      Schema.commitOperation('changeNodeAlign', changedIds, '设置对齐')
      SchemaHistory.commit('设置对齐')
      this.needAlign = false
    }
  }
  private alignLeft() {
    const alignBound = this.getAlignBound()
    this.toAlignNodes.forEach((node) => {
      const { nodeOBB, nodeBound } = this.getOBBAndBound(node)
      const shift = alignBound.left - nodeBound.left
      this.horizontalAlign(node, nodeOBB, shift)
    })
  }
  private alignCenter() {
    const alignBound = this.getAlignBound()
    this.toAlignNodes.forEach((node) => {
      const { nodeOBB, nodeBound } = this.getOBBAndBound(node)
      const shift = alignBound.centerX - nodeBound.centerX
      this.horizontalAlign(node, nodeOBB, shift)
    })
  }
  private alignRight() {
    const alignBound = this.getAlignBound()
    this.toAlignNodes.forEach((node) => {
      const { nodeOBB, nodeBound } = this.getOBBAndBound(node)
      const shift = alignBound.right - nodeBound.right
      this.horizontalAlign(node, nodeOBB, shift)
    })
  }
  private verticalTop() {
    const alignBound = this.getAlignBound()
    this.toAlignNodes.forEach((node) => {
      const { nodeOBB, nodeBound } = this.getOBBAndBound(node)
      const shift = alignBound.top - nodeBound.top
      this.verticalAlign(node, nodeOBB, shift)
    })
  }
  private verticalCenter() {
    const alignBound = this.getAlignBound()
    this.toAlignNodes.forEach((node) => {
      const { nodeOBB, nodeBound } = this.getOBBAndBound(node)
      const shift = alignBound.centerY - nodeBound.centerY
      this.verticalAlign(node, nodeOBB, shift)
    })
  }
  private verticalBottom() {
    const alignBound = this.getAlignBound()
    this.toAlignNodes.forEach((node) => {
      const { nodeOBB, nodeBound } = this.getOBBAndBound(node)
      const shift = alignBound.bottom - nodeBound.bottom
      this.verticalAlign(node, nodeOBB, shift)
    })
  }
  private horizontalAlign(node: INode, nodeOBB: OBB, shift: number) {
    if (shift === 0) return
    this.needAlign = true
    SchemaUtil.traverseIds([node.id], ({ node }) => {
      Schema.itemReset(node, ['x'], node.x + shift)
      Schema.itemReset(node, ['centerX'], node.centerX + shift)
      nodeOBB.shiftX(shift)
      StageDraw.collectRedraw(node.id)
    })
  }
  private verticalAlign(node: INode, nodeOBB: OBB, shift: number) {
    if (shift === 0) return
    this.needAlign = true
    SchemaUtil.traverseIds([node.id], ({ node }) => {
      Schema.itemReset(node, ['y'], node.y + shift)
      Schema.itemReset(node, ['centerY'], node.centerY + shift)
      nodeOBB.shiftY(shift)
      StageDraw.collectRedraw(node.id)
    })
  }
  private getAlignBound() {
    const { selectNodes } = OperateNode
    if (selectNodes.length > 1) {
      return StageWidgetTransform.transformOBB.getAABBBound()
    } else {
      return StageElement.OBBCache.get(selectNodes[0].id).getAABBBound()
    }
  }
  private getOBBAndBound(node: INode) {
    const nodeOBB = StageElement.OBBCache.get(node.id)
    const nodeBound = nodeOBB.getAABBBound()
    return { nodeOBB, nodeBound }
  }
}

export const OperateAlign = new OperateAlignService()
