import autobind from 'class-autobind-decorator'
import { cloneDeep } from 'lodash-es'
import { createMomentChange } from '~/shared/intercept-data/moment-change'
import { createSignal } from '~/shared/signal/signal'
import { rgb } from '~/shared/utils/color'
import { Delete } from '~/shared/utils/normal'
import { Record } from '../record'
import { SchemaDefault } from '../schema/default'
import { Schema } from '../schema/schema'
import { INode, IStroke } from '../schema/type'
import { StageDraw } from '../stage/draw/draw'
import { StageSelect } from '../stage/interact/select'
import { UIPicker } from '../ui-state/right-panel/operate/picker'
import { OperateNode } from './node'

type IInitStrokes = Map<string, IStroke[]>

@autobind
export class OperateStrokeService {
  strokes = createSignal<IStroke[] | IInitStrokes>([])
  beforeOperate = createSignal()
  afterOperate = createSignal()
  private isStrokesChanged = false
  private initStrokes = new Map<string, IStroke[]>()
  private oneOperateChange = createMomentChange<{ strokes: IStroke[] | IInitStrokes }>({
    strokes: [],
  })
  initHook() {
    StageSelect.afterSelect.hook(() => {
      this.setupStrokes()
    })
    this.beforeOperate.hook(() => {
      this.oneOperateChange.endCurrent()
    })
    UIPicker.beforeOperate.hook(({ type }) => {
      if (UIPicker.impact !== 'stroke') return
      if (type !== 'solid-color') return
      this.beforeOperate.dispatch()
    })
    UIPicker.currentFill.hook(() => {
      if (UIPicker.impact !== 'stroke') return
      if (!this.isStrokesArray(this.strokes.value)) return
      this.strokes.value[UIPicker.currentIndex].fill = UIPicker.currentFill.value
      this.strokes.dispatch()
    })
    UIPicker.afterOperate.hook(({ type }) => {
      if (UIPicker.impact !== 'stroke') return
      if (type !== 'solid-color') return
      this.afterOperate.dispatch()
    })
    this.strokes.hook(() => {
      // if (this.strokesSignalArgs()?.isSetup) return
      this.isStrokesChanged = true
      OperateNode.makeSelectDirty()
    })
    OperateNode.duringFlushDirty.hook((id) => {
      if (!this.isStrokesChanged) return
      this.applyChange(Schema.find(id))
    })
    OperateNode.afterFlushDirty.hook(() => {
      this.isStrokesChanged = false
    })
    this.afterOperate.hook(() => {
      this.oneOperateChange.update('strokes', cloneDeep(this.strokes.value as IStroke[]))
      this.recordOperate()
    })
  }
  addStroke() {
    this.beforeOperate.dispatch()
    const strokesLength = this.isStrokesArray(this.strokes.value) ? this.strokes.value.length : 0
    const stroke = SchemaDefault.stroke({
      fill: SchemaDefault.fillColor(rgb(0, 0, 0), strokesLength ? 0.25 : 1),
    })
    if (!this.isStrokesArray(this.strokes.value)) this.strokes.value = []
    this.strokes.value.push(stroke)
    this.strokes.dispatch()
    this.afterOperate.dispatch()
  }
  deleteStroke(stroke: IStroke) {
    this.beforeOperate.dispatch()
    Delete(this.strokes.value as IStroke[], (f) => f === stroke)
    this.strokes.dispatch()
    this.afterOperate.dispatch()
  }
  toggleVisible(stroke: IStroke) {
    this.beforeOperate.dispatch()
    stroke.visible = !stroke.visible
    this.strokes.dispatch()
    this.afterOperate.dispatch()
  }
  setWidth(stroke: IStroke, width: number) {
    stroke.width = width
    this.strokes.dispatch()
  }
  setAlign(stroke: IStroke, align: IStroke['align']) {
    this.beforeOperate.dispatch()
    stroke.align = align
    this.strokes.dispatch()
    this.afterOperate.dispatch()
  }
  isStrokesArray(strokes: IStroke[] | IInitStrokes): strokes is IStroke[] {
    return Array.isArray(strokes)
  }
  private setupStrokes() {
    this.initStrokes.clear()
    this.oneOperateChange.endCurrent()
    // this.strokesSignalArgs({ isSetup: true })
    if (OperateNode.selectIds.value.size === 0) {
      this.strokes.dispatch([])
    }
    if (OperateNode.selectNodes.length === 1) {
      const node = OperateNode.selectNodes[0]
      this.oneOperateChange.reset({ strokes: cloneDeep(node.strokes) })
      this.strokes.dispatch(node.strokes)
    }
    if (OperateNode.selectNodes.length > 1) {
      const nodes = OperateNode.selectNodes
      nodes.forEach(({ id, strokes }) => this.initStrokes.set(id, strokes))
      this.oneOperateChange.reset({ strokes: this.initStrokes })
      this.strokes.dispatch(this.initStrokes)
    }
  }
  private applyChange(node: INode) {
    if (this.isStrokesArray(this.strokes.value)) {
      node.strokes = this.strokes.value
    } else node.strokes = this.strokes.value.get(node.id)!
    StageDraw.collectRedraw(node.id)
  }
  private recordOperate() {
    if (Record.isInRedoUndo) return
    const { last, current } = cloneDeep(this.oneOperateChange.record.strokes)
    const travel = (strokes: IStroke[] | IInitStrokes) => {
      this.strokes.dispatch(strokes)
      UIPicker.show.dispatch(false)
    }
    Record.push({
      description: '改变strokes属性',
      detail: { last, current },
      undo: () => travel(last),
      redo: () => travel(current),
    })
  }
}

export const OperateStroke = new OperateStrokeService()
