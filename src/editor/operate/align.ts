import autobind from 'class-autobind-decorator'
import { createSignal } from '~/shared/signal/signal'
import { Schema } from '../schema/schema'
import { INode, INodeParent } from '../schema/type'
import { SchemaUtil } from '../schema/util'
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
      Schema.commitOperation('设置对齐')
      this.needAlign = false
    }
  }
  private alignLeft() {
    const alignBound = this.getAlignBound()
    this.toAlignNodes.forEach((node) => {
      const { nodeBound } = this.getOBBAndBound(node)
      const shift = alignBound.left - nodeBound.left
      this.horizontalAlign(node, shift)
    })
  }
  private alignCenter() {
    const alignBound = this.getAlignBound()
    this.toAlignNodes.forEach((node) => {
      const { nodeBound } = this.getOBBAndBound(node)
      const shift = alignBound.centerX - nodeBound.centerX
      this.horizontalAlign(node, shift)
    })
  }
  private alignRight() {
    const alignBound = this.getAlignBound()
    this.toAlignNodes.forEach((node) => {
      const { nodeBound } = this.getOBBAndBound(node)
      const shift = alignBound.right - nodeBound.right
      this.horizontalAlign(node, shift)
    })
  }
  private verticalTop() {
    const alignBound = this.getAlignBound()
    this.toAlignNodes.forEach((node) => {
      const { nodeBound } = this.getOBBAndBound(node)
      const shift = alignBound.top - nodeBound.top
      this.verticalAlign(node, shift)
    })
  }
  private verticalCenter() {
    const alignBound = this.getAlignBound()
    this.toAlignNodes.forEach((node) => {
      const { nodeBound } = this.getOBBAndBound(node)
      const shift = alignBound.centerY - nodeBound.centerY
      this.verticalAlign(node, shift)
    })
  }
  private verticalBottom() {
    const alignBound = this.getAlignBound()
    this.toAlignNodes.forEach((node) => {
      const { nodeBound } = this.getOBBAndBound(node)
      const shift = alignBound.bottom - nodeBound.bottom
      this.verticalAlign(node, shift)
    })
  }
  private horizontalAlign(node: INode, shift: number) {
    if (shift === 0) return
    this.needAlign = true
    SchemaUtil.traverseIds([node.id], ({ node }) => {
      Schema.itemReset(node, ['x'], node.x + shift)
      Schema.itemReset(node, ['centerX'], node.centerX + shift)
      return false
    })
  }
  private verticalAlign(node: INode, shift: number) {
    if (shift === 0) return
    this.needAlign = true
    SchemaUtil.traverseIds([node.id], ({ node }) => {
      Schema.itemReset(node, ['y'], node.y + shift)
      Schema.itemReset(node, ['centerY'], node.centerY + shift)
      return false
    })
  }
  private getAlignBound() {
    const { selectNodes } = OperateNode
    if (selectNodes.length > 1) {
      return StageWidgetTransform.transformOBB.getAABBBound()
    } else {
      return OperateNode.getNodeRuntime(selectNodes[0].id).obb.getAABBBound()
    }
  }
  private getOBBAndBound(node: INode) {
    const nodeOBB = OperateNode.getNodeRuntime(node.id).obb
    const nodeBound = nodeOBB.getAABBBound()
    return { nodeBound }
  }
}

export const OperateAlign = new OperateAlignService()
