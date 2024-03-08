import autobind from 'class-autobind-decorator'
import { cloneDeep } from 'lodash-es'
import { createMomentChange } from '~/shared/intercept-data/moment-change'
import { createSignal, createSignalArgs } from '~/shared/signal'
import { rgba } from '~/shared/utils/color'
import { Delete } from '~/shared/utils/normal'
import { Record, recordSignalContext } from '../record'
import { SchemaDefault } from '../schema/default'
import { SchemaNode } from '../schema/node'
import { IFill, INode } from '../schema/type'
import { StageDraw } from '../stage/draw/draw'
import { StageSelect } from '../stage/interact/select'

@autobind
export class OperateFillService {
  fills = createSignal<IFill[]>([])
  beforeOperate = createSignal()
  afterOperate = createSignal()
  isMultiFills = false
  private isFillsChanged = false
  private initFills = new Map<string, IFill[]>()
  private oneOperateChange = createMomentChange({ fills: <IFill[] | 'multi'>[] })
  private fillsSignalArgs = createSignalArgs<{ isSetup: boolean }>()
  initHook() {
    StageSelect.afterSelect.hook(() => {
      this.setupFills()
    })
    this.beforeOperate.hook(() => {
      this.oneOperateChange.endCurrent()
    })
    this.fills.hook(() => {
      if (this.fillsSignalArgs()?.isSetup) return
      this.isFillsChanged = true
      SchemaNode.makeSelectDirty()
    })
    SchemaNode.duringFlushDirty.hook((id) => {
      if (!this.isFillsChanged) return
      this.applyChange(SchemaNode.find(id))
    })
    this.afterOperate.hook(() => {
      this.oneOperateChange.update('fills', cloneDeep(this.fills.value))
      this.record()
    })
  }
  addFill() {
    this.beforeOperate.dispatch()
    const fill = SchemaDefault.fillColor(rgba(204, 204, 204, this.fills.value.length ? 0.25 : 1))
    this.fills.dispatch((fills) => fills.push(fill))
    this.afterOperate.dispatch()
  }
  deleteFill(fill: IFill) {
    this.beforeOperate.dispatch()
    Delete(this.fills.value, (f) => f === fill)
    this.fills.dispatch()
    this.afterOperate.dispatch()
  }
  toggleVisible(fill: IFill) {
    this.beforeOperate.dispatch()
    fill.visible = !fill.visible
    this.fills.dispatch()
    this.afterOperate.dispatch()
  }
  private setupFills() {
    this.isMultiFills = false
    this.initFills.clear()
    this.oneOperateChange.endCurrent()
    this.fillsSignalArgs({ isSetup: true })
    if (SchemaNode.selectIds.value.size === 0) {
      this.fills.dispatch([])
    }
    if (SchemaNode.selectNodes.length === 1) {
      const node = SchemaNode.selectNodes[0]
      this.oneOperateChange.reset({ fills: cloneDeep(node.fills) })
      this.fills.dispatch(node.fills)
    }
    if (SchemaNode.selectNodes.length > 1) {
      const nodes = SchemaNode.selectNodes
      nodes.forEach(({ id, fills }) => this.initFills.set(id, fills))
      this.oneOperateChange.reset({ fills: /* 'multi' */ [] })
      this.fills.dispatch([])
      this.isMultiFills = true
    }
  }
  private applyChange(node: INode) {
    node.fills = this.fills.value
    StageDraw.collectRedraw(node.id)
  }
  private record() {
    if (recordSignalContext()) return
    const { last, current } = cloneDeep(this.oneOperateChange.record.fills)
    Record.push({
      description: '改变fills属性',
      detail: { last, current },
      undo: () => this.fills.dispatch(last as IFill[]),
      redo: () => this.fills.dispatch(current as IFill[]),
    })
  }
}

export const OperateFill = new OperateFillService()
