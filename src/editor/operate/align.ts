import autobind from 'class-autobind-decorator'
import { createMomentChange } from '~/shared/intercept-data/moment-change'
import { createSignal } from '~/shared/signal'
import { XY } from '~/shared/structure/xy'
import { IXY } from '~/shared/utils/normal'
import { OBB } from '../math/obb'
import { xy_new } from '../math/xy'
import { Record, recordSignalContext } from '../record'
import { SchemaNode } from '../schema/node'
import { INode } from '../schema/type'
import { SchemaUtil } from '../schema/util'
import { StageDraw } from '../stage/draw/draw'
import { StageElement } from '../stage/element'
import { StageSelect } from '../stage/interact/select'
import { StageWidgetTransform } from '../stage/widget/transform'

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
export class OperateAlignService {
  alignTypes = alignTypes
  canAlign = createSignal(false)
  currentAlign = createSignal<IAlignType>()
  afterAlign = createSignal()
  private needAlign = false
  private toAlignNodes = <INode[]>[]
  private oneAlignChange = createMomentChange(<Record<string, IXY>>{})
  initHook() {
    StageSelect.afterSelect.hook(this.setupAlign)
    this.currentAlign.hook(this.autoAlign)
  }
  private setupAlign() {
    if (SchemaNode.selectNodes.length === 0) {
      this.canAlign.dispatch(false)
    } else if (SchemaNode.selectNodes.length > 1) {
      this.toAlignNodes = [...SchemaNode.selectNodes]
      this.canAlign.dispatch(true)
    } else if (
      SchemaNode.selectNodes.length === 1 &&
      SchemaUtil.isContainerNode(SchemaNode.selectNodes[0])
    ) {
      const node = SchemaNode.selectNodes[0]
      this.toAlignNodes = SchemaUtil.getChildren(node.id)
      this.canAlign.dispatch(true)
    }
    const nodeXYDataMap = Object.fromEntries(
      this.toAlignNodes.map((node) => [node.id, XY.Of(0, 0).toObject()])
    )
    this.oneAlignChange.reset(nodeXYDataMap)
  }
  private autoAlign() {
    this[this.currentAlign.value]()
    if (this.needAlign) {
      this.afterAlign.dispatch()
      this.undoRedo()
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
    this.oneAlignChange.update(node.id, xy_new(shift, 0))
    if (shift === 0) return
    this.needAlign = true
    node.x += shift
    node.centerX += shift
    nodeOBB.shiftX(shift)
    StageDraw.collectRedraw(node.id)
  }
  private verticalAlign(node: INode, nodeOBB: OBB, shift: number) {
    this.oneAlignChange.update(node.id, xy_new(0, shift))
    if (shift === 0) return
    this.needAlign = true
    node.y += shift
    node.centerY += shift
    nodeOBB.shiftY(shift)
    StageDraw.collectRedraw(node.id)
  }
  private getAlignBound() {
    if (SchemaNode.selectNodes.length > 1) {
      return StageWidgetTransform.transformOBB.getAABBBound()
    } else {
      return StageElement.OBBCache.get(SchemaNode.selectNodes[0].id).getAABBBound()
    }
  }
  private getOBBAndBound(node: INode) {
    const nodeOBB = StageElement.OBBCache.get(node.id)
    const nodeBound = nodeOBB.getAABBBound()
    return { nodeOBB, nodeBound }
  }
  private undoRedo() {
    if (recordSignalContext()) return
    const toAlignNodeIds = this.toAlignNodes.map((node) => node.id)
    const record = structuredClone(this.oneAlignChange.record)
    const travel = (type: 'last' | 'current') => {
      toAlignNodeIds.forEach((id) => {
        const node = SchemaNode.find(id)
        const nodeOBB = StageElement.OBBCache.get(id)
        let { x, y } = record[node.id]['current']
        const direction = type === 'last' ? 1 : -1
        node.x -= x * direction
        node.y -= y * direction
        node.centerX -= x * direction
        node.centerY -= y * direction
        nodeOBB.shiftX(-(x * direction))
        nodeOBB.shiftY(-(y * direction))
        this.afterAlign.dispatch()
        StageDraw.collectRedraw(id)
      })
      recordSignalContext(false)
    }
    Record.push({
      description: '设置对齐 ' + this.currentAlign.value,
      detail: Object.fromEntries(Object.entries(record).map(([k, v]) => [k, record[k].current])),
      undo: () => travel('last'),
      redo: () => travel('current'),
    })
  }
}

export const OperateAlign = new OperateAlignService()
