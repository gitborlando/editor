import autobind from 'class-autobind-decorator'
import equal from 'fast-deep-equal'
import Immui from 'src/shared/immui/immui'
import { clone } from 'src/shared/utils/normal'
import { rgb } from 'src/utils/color'
import { SchemaCreator } from '../schema/create'
import { SchemaHistory } from '../schema/history'
import { Schema } from '../schema/schema'
import { IFill, IFillKeys, INode } from '../schema/type'
import { UIPickerCopy } from '../ui-state/right-panel/operate/picker'
import { OperateNode } from './node'

@autobind
class OperateFillService {
  fills = <IFill[]>[]
  isMultiFills = false
  private immui = new Immui()
  initHook() {
    OperateNode.selectedNodes$.hook(this.setupFills)
    Schema.onMatchPatch('/?/fills/...', this.setupFills)
    this.onUiPickerSetFill()
  }
  setupFills() {
    this.fills = []
    this.isMultiFills = false
    const nodes = OperateNode.selectingNodes
    if (nodes.length === 1) return (this.fills = clone(nodes[0].fills))
    if (nodes.length > 1) {
      if (this.isSameFills(nodes)) return (this.fills = clone(nodes[0].fills))
      return (this.isMultiFills = true)
    }
  }
  addFill() {
    if (!OperateNode.selectedNodes.value.length) return
    const fillsLength = this.fills.length
    const fill = SchemaCreator.fillColor(rgb(204, 204, 204), fillsLength ? 0.25 : 1)
    this.immui.add(this.fills, [fillsLength], fill)
    this.applyChangeToSchema()
    SchemaHistory.commit('添加 fill')
  }
  deleteFill(index: number) {
    if (!this.fills.length) return
    this.immui.delete(this.fills, [index])
    this.applyChangeToSchema()
    SchemaHistory.commit('删除 fill')
  }
  setFill(index: number, keys: IFillKeys[], value: any) {
    if (!this.fills.length) return
    this.immui.reset(this.fills, [index, ...keys], value)
    this.applyChangeToSchema()
    SchemaHistory.commit('改变 fill')
  }
  changeFill(index: number, newFill: IFill) {
    if (!this.fills.length) return
    this.immui.reset(this.fills, [index], newFill)
    this.applyChangeToSchema()
    SchemaHistory.commit('改变 fills')
  }
  applyChangeToSchema() {
    const nodes = OperateNode.selectedNodes.value
    const patches = this.immui.next(this.fills)[1]
    nodes.forEach((node) => {
      if (this.isMultiFills) Schema.itemReset(node, ['fills'], [])
      Schema.applyPatches(patches, { prefix: `/${node.id}/fills` })
    })
    Schema.commitOperation('改变 fills')
    Schema.nextSchema()
  }
  private onUiPickerSetFill() {
    UIPickerCopy.onChange.hook((patches) => {
      if (UIPickerCopy.from !== 'fill') return
      this.immui.applyPatches(this.fills, patches, {
        prefix: `/${UIPickerCopy.index}`,
      })
      this.applyChangeToSchema()
    })
    UIPickerCopy.afterOperate.hook(() => {
      if (UIPickerCopy.from !== 'fill') return
      SchemaHistory.commit('改变 fills')
    })
  }
  private isSameFills(nodes: INode[]) {
    let isSame = true
    const firstNode = nodes[0]

    nodes.forEach((node) => {
      if (!isSame) return
      if (node.fills.length !== firstNode.fills.length) return (isSame = false)
      firstNode.fills.forEach((fill, index) => {
        const otherFill = node.fills[index]
        if (fill.type !== otherFill.type) return (isSame = false)
        if (!equal(fill, otherFill)) return (isSame = false)
      })
    })
    return isSame
  }
}

export const OperateFill = new OperateFillService()
