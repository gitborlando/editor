import autobind from 'class-autobind-decorator'
import equal from 'fast-deep-equal'
import { cloneDeep } from 'lodash-es'
import Immui from '~/shared/immui/immui'
import { createSignal } from '~/shared/signal/signal'
import { rgb } from '~/shared/utils/color'
import { SchemaDefault } from '../schema/default'
import { SchemaHistory } from '../schema/history'
import { Schema } from '../schema/schema'
import { INode, IStroke } from '../schema/type'
import { UIPickerCopy } from '../ui-state/right-panel/operate/picker'
import { OperateNode } from './node'

@autobind
class OperateStrokeService {
  strokes = <IStroke[]>[]
  isMultiStrokes = false
  afterOperate = createSignal()
  private immui = new Immui()
  initHook() {
    OperateNode.selectedNodes.hook({ id: 'setupStrokes' }, this.setupStrokes)
    this.onUiPickerSetStroke()
    this.afterOperate.hook(() => {
      SchemaHistory.commit('改变 strokes')
    })
  }
  setupStrokes() {
    this.strokes = []
    this.isMultiStrokes = false
    const nodes = OperateNode.selectedNodes.value
    if (nodes.length === 1) return (this.strokes = cloneDeep(nodes[0].strokes))
    if (nodes.length > 1) {
      if (this.isSameStrokes(nodes)) return (this.strokes = cloneDeep(nodes[0].strokes))
      return (this.isMultiStrokes = true)
    }
  }
  addStroke() {
    const strokesLength = this.strokes.length
    const stroke = SchemaDefault.stroke({
      fill: SchemaDefault.fillColor(rgb(0, 0, 0), strokesLength ? 0.25 : 1),
    })
    this.immui.add(this.strokes, [strokesLength], stroke)
    this.applyChangeToSchema()
    SchemaHistory.commit('添加 stroke')
  }
  deleteStroke(index: number) {
    this.immui.delete(this.strokes, [index])
    this.applyChangeToSchema()
    SchemaHistory.commit('删除 stroke')
  }
  setStroke(index: number, keys: string[], value: any) {
    this.immui.reset(this.strokes, [index, ...keys], value)
    this.applyChangeToSchema()
  }
  toggleStroke(index: number, keys: string[], value: any) {
    this.immui.reset(this.strokes, [index, ...keys], value)
    this.applyChangeToSchema()
    SchemaHistory.commit('改变 stroke')
  }
  changeStroke(index: number, newStroke: IStroke) {
    this.immui.reset(this.strokes, [index], newStroke)
    this.applyChangeToSchema()
    SchemaHistory.commit('改变 strokes')
  }
  applyChangeToSchema() {
    const nodes = OperateNode.selectedNodes.value
    const patches = this.immui.commitPatches()
    nodes.forEach((node) => {
      if (this.isMultiStrokes) Schema.itemReset(node, ['strokes'], [])
      Schema.applyPatches(patches, { prefix: `/${node.id}/strokes` })
    })
    Schema.commitOperation('改变 strokes')
    Schema.nextSchema()
  }
  private onUiPickerSetStroke() {
    UIPickerCopy.onChange.hook((patches) => {
      if (UIPickerCopy.from !== 'stroke') return
      this.immui.applyPatches(this.strokes, patches, { prefix: `/${UIPickerCopy.index}/fill` })
      this.applyChangeToSchema()
    })
    UIPickerCopy.afterOperate.hook(() => {
      if (UIPickerCopy.from !== 'stroke') return
      SchemaHistory.commit('改变 strokes')
    })
  }
  private isSameStrokes(nodes: INode[]) {
    let isSame = true
    const firstNode = nodes[0]
    nodes.forEach(({ strokes }) => {
      if (!isSame) return
      if (strokes.length !== firstNode.strokes.length) return (isSame = false)
      firstNode.strokes.forEach((stroke, index) => {
        const otherStroke = strokes[index]
        if (!equal(stroke, otherStroke)) return (isSame = false)
      })
    })
    return isSame
  }
}

export const OperateStroke = new OperateStrokeService()
