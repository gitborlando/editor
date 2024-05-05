import autobind from 'class-autobind-decorator'
import { cloneDeep } from 'lodash-es'
import { createMomentChange } from '~/shared/intercept-data/moment-change'
import { createSignal } from '~/shared/signal/signal'
import { Delete } from '~/shared/utils/normal'
import { Record } from '../record'
import { SchemaDefault } from '../schema/default'
import { Schema } from '../schema/schema'
import { IFillColor, INode, IShadow } from '../schema/type'
import { StageDraw2 } from '../stage/draw/draw'
import { StageSelect } from '../stage/interact/select'
import { UIPicker } from '../ui-state/right-panel/operate/picker'
import { OperateNode } from './node'

type IInitShadows = Map<string, IShadow[]>

@autobind
class OperateShadowService {
  shadows = createSignal<IShadow[] | IInitShadows>([])
  beforeOperate = createSignal()
  afterOperate = createSignal()
  private isShadowsChanged = false
  private initShadows = new Map<string, IShadow[]>()
  private oneOperateChange = createMomentChange<{ shadows: IShadow[] | IInitShadows }>({
    shadows: [],
  })
  initHook() {
    StageSelect.afterSelect.hook(() => {
      this.setupShadows()
    })
    this.beforeOperate.hook(() => {
      this.oneOperateChange.endCurrent()
    })
    UIPicker.beforeOperate.hook(({ type }) => {
      if (UIPicker.impact !== 'shadow') return
      if (type !== 'solid-color') return
      this.beforeOperate.dispatch()
    })
    UIPicker.currentFill.hook(() => {
      if (UIPicker.impact !== 'shadow') return
      if (!this.isShadowsArray(this.shadows.value)) return
      this.shadows.value[UIPicker.currentIndex].fill = UIPicker.currentFill.value as IFillColor
      this.shadows.dispatch()
    })
    UIPicker.afterOperate.hook(({ type }) => {
      if (UIPicker.impact !== 'shadow') return
      if (type !== 'solid-color') return
      this.afterOperate.dispatch()
    })
    this.shadows.hook(() => {
      // if (this.shadowsSignalArgs()?.isSetup) return
      this.isShadowsChanged = true
      OperateNode.makeSelectDirty()
    })
    OperateNode.duringFlushDirty.hook((id) => {
      if (!this.isShadowsChanged) return
      this.applyChange(Schema.find(id))
    })
    OperateNode.afterFlushDirty.hook(() => {
      this.isShadowsChanged = false
    })
    this.afterOperate.hook(() => {
      this.oneOperateChange.update('shadows', cloneDeep(this.shadows.value as IShadow[]))
      this.recordOperate()
    })
  }
  addShadow() {
    this.beforeOperate.dispatch()
    const shadow = SchemaDefault.shadow()
    if (!this.isShadowsArray(this.shadows.value)) this.shadows.value = []
    this.shadows.value.push(shadow)
    this.shadows.dispatch()
    this.afterOperate.dispatch()
  }
  deleteShadow(shadow: IShadow) {
    this.beforeOperate.dispatch()
    Delete(this.shadows.value as IShadow[], (f) => f === shadow)
    this.shadows.dispatch()
    this.afterOperate.dispatch()
  }
  toggleVisible(shadow: IShadow) {
    this.beforeOperate.dispatch()
    shadow.visible = !shadow.visible
    this.shadows.dispatch()
    this.afterOperate.dispatch()
  }
  setAttribute<K extends keyof IShadow>(shadow: IShadow, key: K, value: IShadow[K]) {
    shadow[key] = value
    this.shadows.dispatch()
  }
  isShadowsArray(shadows: IShadow[] | IInitShadows): shadows is IShadow[] {
    return Array.isArray(shadows)
  }
  private setupShadows() {
    this.initShadows.clear()
    this.oneOperateChange.endCurrent()
    // this.shadowsSignalArgs({ isSetup: true })
    if (OperateNode.selectIds.value.size === 0) {
      this.shadows.dispatch([])
    }
    if (OperateNode.selectNodes.length === 1) {
      const node = OperateNode.selectNodes[0]
      this.oneOperateChange.reset({ shadows: cloneDeep(node.shadows) })
      this.shadows.dispatch(node.shadows)
    }
    if (OperateNode.selectNodes.length > 1) {
      const nodes = OperateNode.selectNodes
      nodes.forEach(({ id, shadows }) => this.initShadows.set(id, shadows))
      this.oneOperateChange.reset({ shadows: this.initShadows })
      this.shadows.dispatch(this.initShadows)
    }
  }
  private applyChange(node: INode) {
    if (this.isShadowsArray(this.shadows.value)) {
      node.shadows = this.shadows.value
    } else node.shadows = this.shadows.value.get(node.id)!
    StageDraw2.collectRedraw(node.id)
  }
  private recordOperate() {
    if (Record.isInRedoUndo) return
    const { last, current } = cloneDeep(this.oneOperateChange.record.shadows)
    const travel = (shadows: IShadow[] | IInitShadows) => {
      this.shadows.dispatch(shadows)
      UIPicker.show.dispatch(false)
    }
    Record.push({
      description: '改变shadows属性',
      detail: { last, current },
      undo: () => travel(last),
      redo: () => travel(current),
    })
  }
}

export const OperateShadow = new OperateShadowService()
