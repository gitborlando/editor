import autobind from 'class-autobind-decorator'
import { cloneDeep } from 'lodash-es'
import { createMomentChange } from '~/shared/intercept-data/moment-change'
import { createSignal, createSignalArgs } from '~/shared/signal'
import { Delete } from '~/shared/utils/normal'
import { Record, recordSignalContext } from '../record'
import { SchemaDefault } from '../schema/default'
import { SchemaNode } from '../schema/node'
import { INode, IStroke } from '../schema/type'
import { StageDraw } from '../stage/draw/draw'
import { StageSelect } from '../stage/interact/select'
import { UIPicker } from '../ui-state/right-planel/operate/picker'

@autobind
export class OperateStrokeService {
  strokes = createSignal<IStroke[]>([])
  beforeOperate = createSignal()
  afterOperate = createSignal()
  isMultiStrokes = false
  private isStrokesChanged = false
  private initStrokes = new Map<string, IStroke[]>()
  private oneOperateChange = createMomentChange({ strokes: <IStroke[] | 'multi'>[] })
  private strokesSignalArgs = createSignalArgs<{ isSetup: boolean }>()
  initHook() {
    StageSelect.afterSelect.hook(() => {
      this.setupStrokes()
    })
    this.beforeOperate.hook(() => {
      this.oneOperateChange.endCurrent()
    })
    UIPicker.currentFill.hook(() => {
      if (UIPicker.impact !== 'stroke') return
      this.strokes.dispatch((strokes) => {
        strokes[UIPicker.currentIndex].fill = UIPicker.currentFill.value
      })
    })
    this.strokes.hook(() => {
      if (this.strokesSignalArgs()?.isSetup) return
      this.isStrokesChanged = true
      SchemaNode.makeSelectDirty()
    })
    SchemaNode.duringFlushDirty.hook((id) => {
      if (!this.isStrokesChanged) return
      this.applyChange(SchemaNode.find(id))
      this.isStrokesChanged = false
    })
    this.afterOperate.hook(() => {
      this.oneOperateChange.update('strokes', cloneDeep(this.strokes.value))
      this.record()
    })
  }
  addStroke() {
    this.beforeOperate.dispatch()
    const stroke = SchemaDefault.stroke()
    this.strokes.dispatch((strokes) => strokes.push(stroke))
    this.afterOperate.dispatch()
  }
  deleteStroke(stroke: IStroke) {
    this.beforeOperate.dispatch()
    Delete(this.strokes.value, (f) => f === stroke)
    this.strokes.dispatch()
    this.afterOperate.dispatch()
  }
  toggleVisible(stroke: IStroke) {
    this.beforeOperate.dispatch()
    stroke.visible = !stroke.visible
    this.strokes.dispatch()
    this.afterOperate.dispatch()
  }
  private setupStrokes() {
    this.isMultiStrokes = false
    this.initStrokes.clear()
    this.oneOperateChange.endCurrent()
    this.strokesSignalArgs({ isSetup: true })
    if (SchemaNode.selectIds.value.size === 0) {
      this.strokes.dispatch([])
    }
    if (SchemaNode.selectNodes.length === 1) {
      const node = SchemaNode.selectNodes[0]
      this.oneOperateChange.reset({ strokes: cloneDeep(node.strokes) })
      this.strokes.dispatch(node.strokes)
    }
    if (SchemaNode.selectNodes.length > 1) {
      const nodes = SchemaNode.selectNodes
      nodes.forEach(({ id, strokes }) => this.initStrokes.set(id, strokes))
      this.oneOperateChange.reset({ strokes: /* 'multi' */ [] })
      this.strokes.dispatch([])
      this.isMultiStrokes = true
    }
  }
  private applyChange(node: INode) {
    node.strokes = this.strokes.value
    StageDraw.collectRedraw(node.id)
  }
  private record() {
    if (recordSignalContext()) return
    const { last, current } = cloneDeep(this.oneOperateChange.record.strokes)
    Record.push({
      description: '改变strokes属性',
      detail: { last, current },
      undo: () => this.strokes.dispatch(last as IStroke[]),
      redo: () => this.strokes.dispatch(current as IStroke[]),
    })
  }
}

export const OperateStroke = new OperateStrokeService()
