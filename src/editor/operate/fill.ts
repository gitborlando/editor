import autobind from 'class-autobind-decorator'
import equal from 'fast-deep-equal'
import { cloneDeep } from 'lodash-es'
import { createMomentChange } from '~/shared/intercept-data/moment-change'
import { createSignal } from '~/shared/signal/signal'
import { rgba } from '~/shared/utils/color'
import { Delete } from '~/shared/utils/normal'
import { Record } from '../record'
import { SchemaDefault } from '../schema/default'
import { Schema } from '../schema/schema'
import { IFill, INode } from '../schema/type'
import { StageDraw } from '../stage/draw/draw'
import { StageSelect } from '../stage/interact/select'
import { UIPicker } from '../ui-state/right-panel/operate/picker'
import { OperateNode } from './node'

type IInitFills = Map<string, IFill[]>

@autobind
export class OperateFillService {
  fills = createSignal<IFill[] | IInitFills>([])
  beforeOperate = createSignal()
  afterOperate = createSignal()
  private isFillsChanged = false
  private initFills = new Map<string, IFill[]>()
  private oneOperateChange = createMomentChange<{ fills: IFill[] | IInitFills }>({ fills: [] })
  initHook() {
    StageSelect.afterSelect.hook(() => {
      this.setupFills()
    })
    this.beforeOperate.hook(() => {
      this.oneOperateChange.endCurrent()
    })
    UIPicker.beforeOperate.hook(({ type }) => {
      if (type !== 'solid-color') return
      this.beforeOperate.dispatch()
    })
    UIPicker.currentFill.hook(() => {
      if (UIPicker.impact !== 'fill') return
      if (!this.isFillsArray(this.fills.value)) return
      this.fills.value[UIPicker.currentIndex] = UIPicker.currentFill.value
      this.fills.dispatch()
    })
    UIPicker.afterOperate.hook(({ type }) => {
      if (type !== 'solid-color') return
      this.afterOperate.dispatch()
    })
    this.fills.hook((_, args) => {
      if (args?.isSetup) return
      this.isFillsChanged = true
      OperateNode.makeSelectDirty()
    })
    OperateNode.duringFlushDirty.hook((id) => {
      if (!this.isFillsChanged) return
      this.applyChange(Schema.find(id))
    })
    OperateNode.afterFlushDirty.hook(() => {
      this.isFillsChanged = false
    })
    this.afterOperate.hook(() => {
      this.oneOperateChange.update('fills', cloneDeep(this.fills.value as IFill[]))
      this.recordOperate()
    })
  }
  addFill() {
    this.beforeOperate.dispatch()
    const fillsLength = this.isFillsArray(this.fills.value) ? this.fills.value.length : 0
    const fill = SchemaDefault.fillColor(rgba(204, 204, 204, fillsLength ? 0.25 : 1))
    if (!this.isFillsArray(this.fills.value)) this.fills.value = []
    this.fills.value.push(fill)
    this.fills.dispatch()
    this.afterOperate.dispatch()
  }
  deleteFill(fill: IFill) {
    this.beforeOperate.dispatch()
    Delete(this.fills.value as IFill[], (f) => f === fill)
    this.fills.dispatch()
    this.afterOperate.dispatch()
  }
  toggleVisible(fill: IFill) {
    this.beforeOperate.dispatch()
    fill.visible = !fill.visible
    this.fills.dispatch()
    this.afterOperate.dispatch()
  }
  isFillsArray(fills: IFill[] | IInitFills): fills is IFill[] {
    return Array.isArray(fills)
  }
  private setupFills() {
    this.initFills.clear()
    this.oneOperateChange.endCurrent()
    const selectNodes = OperateNode.selectNodes
    if (selectNodes.length === 0) {
      this.fills.dispatch([], { isSetup: true })
    }
    if (selectNodes.length === 1) {
      const node = selectNodes[0]
      this.oneOperateChange.reset({ fills: cloneDeep(node.fills) })
      this.fills.dispatch(node.fills, { isSetup: true })
    }
    if (selectNodes.length > 1) {
      const isSame = this.sameFills(selectNodes)
      const fills = isSame ? cloneDeep(selectNodes[0].fills) : this.initFills
      this.oneOperateChange.reset({ fills })
      this.fills.dispatch(fills, { isSetup: true })
    }
  }
  private applyChange(node: INode) {
    if (this.isFillsArray(this.fills.value)) {
      node.fills = this.fills.value
    } else node.fills = this.fills.value.get(node.id)!
    StageDraw.collectRedraw(node.id)
  }
  private sameFills(nodes: INode[]) {
    let isSame = true
    const firstNode = nodes[0]
    nodes.forEach(({ id, fills }) => {
      if (!isSame) return this.initFills.set(id, fills)
      if (fills.length !== firstNode.fills.length) return (isSame = false)
      firstNode.fills.forEach((fill, index) => {
        const otherFill = fills[index]
        if (fill.type !== otherFill.type) return (isSame = false)
        if (!equal(fill, otherFill)) return (isSame = false)
      })
    })
    if (!isSame) this.initFills.set(firstNode.id, firstNode.fills)
    return isSame
  }
  private recordOperate() {
    if (Record.isInRedoUndo) return
    const { last, current } = cloneDeep(this.oneOperateChange.record.fills)
    const travel = (fills: IFill[] | IInitFills) => {
      this.fills.dispatch(fills)
      UIPicker.show.dispatch(false)
    }
    Record.push({
      description: '改变fills属性',
      detail: { last, current },
      undo: () => travel(last),
      redo: () => travel(current),
    })
  }
}

export const OperateFill = new OperateFillService()
