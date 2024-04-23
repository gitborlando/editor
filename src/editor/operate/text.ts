import autobind from 'class-autobind-decorator'
import { diffApply } from 'just-diff-apply'
import { createSignal, multiSignal as multiSignals } from '~/shared/signal'
import { Diff, IOperateDiff, createNodeDiffPath } from '../diff'
import { Record } from '../record'
import { SchemaNode } from '../schema/node'
import { Schema } from '../schema/schema'
import { IText } from '../schema/type'
import { StageDraw } from '../stage/draw/draw'
import { StageSelect } from '../stage/interact/select'

type ITextStyle = IText['style']
export type ITextStyleKey = keyof ITextStyle
type IMulti = 'multi' & (string & {})

type IBaseStyle = ReturnType<typeof createBaseStyle>
const createBaseStyle = () => ({
  fontSize: <ITextStyle['fontSize']>16,
  fontWeight: <ITextStyle['fontWeight']>'500',
  align: <ITextStyle['align']>'left',
  breakWords: <ITextStyle['breakWords']>true,
  fontFamily: <ITextStyle['fontFamily']>'Arial',
  fontStyle: <ITextStyle['fontStyle']>'normal',
  letterSpacing: <ITextStyle['letterSpacing']>30,
  lineHeight: <ITextStyle['lineHeight']>16,
  wordWrap: <ITextStyle['wordWrap']>true,
})
// const createBaseStyle = () => ({
//   fontSize: <ITextStyle['fontSize'] | IMulti>16,
//   fontWeight: <ITextStyle['fontWeight'] | IMulti>'500',
//   align: <ITextStyle['align'] | IMulti>'left',
//   breakWords: <ITextStyle['breakWords'] | IMulti>false,
//   fontFamily: <ITextStyle['fontFamily'] | IMulti>'Arial',
//   fontStyle: <ITextStyle['fontStyle'] | IMulti>'normal',
//   letterSpacing: <ITextStyle['letterSpacing'] | IMulti>0,
//   lineHeight: <ITextStyle['lineHeight'] | IMulti>16,
// })

export const textStyleKeys = <ITextStyleKey[]>Object.keys(createBaseStyle())

@autobind
export class OperateTextService {
  textStyle = createSignal(<IBaseStyle>createBaseStyle())
  beforeOperate = createSignal<ITextStyleKey | 'content' | null>()
  afterOperate = createSignal()
  intoEditing = createSignal<IText | null>(null)
  textNodes = <IText[]>[]
  textStyleOptions = createTextStyleOptions()
  initHook() {
    StageSelect.afterSelect.hook(() => {
      this.textNodes = SchemaNode.selectNodes.filter((node) => {
        return node.type === 'text'
      }) as IText[]
      if (!this.textNodes.length) return
      this.setupTextStyle()
    })
    this.beforeOperate.hook(() => {
      this.setDiff('inverse')
    })
    this.textStyle.hook(() => {
      if (this.textStyle.arguments.isSetupCause) return
      this.textNodes.forEach((node) => SchemaNode.collectDirty(node.id))
    })
    SchemaNode.duringFlushDirty.hook((id) => {
      const node = SchemaNode.find(id)
      if (node.type !== 'text') return
      this.applyChange(node)
    })
    multiSignals([SchemaNode.afterFlushDirty, this.afterOperate], () => {
      const operateKey = this.beforeOperate.value!
      this.setDiff('not inverse')
      const operateDiff = Diff.commitOperateDiff(
        operateKey === 'content' ? '改变 text content' : '改变 text style'
      )
      this.recordOperate(operateDiff)
      this.beforeOperate.value = null
    })
  }
  setTextStyle(key: ITextStyleKey, value: ITextStyle[ITextStyleKey]) {
    this.textStyle.dispatch((style) => {
      //@ts-ignore
      style[key] = value //@ts-ignore
    })
  }
  toggleTextStyle(key: ITextStyleKey, value: ITextStyle[ITextStyleKey]) {
    this.beforeOperate.dispatch(key)
    //@ts-ignore
    this.textStyle.dispatch((style) => (style[key] = value))
    this.afterOperate.dispatch()
  }
  private setupTextStyle() {
    textStyleKeys.forEach((key) => {
      let firstNodeStyleValue = this.textNodes[0].style[key] //@ts-ignore
      this.textStyle.value[key] = firstNodeStyleValue
      this.textNodes.forEach(({ style }) => {
        // if (style[key] !== firstNodeStyleValue) this.textStyle.value[key] = 0
      })
    })
    this.textStyle.arguments.isSetupCause = true
    this.textStyle.dispatch()
  }
  private applyChange(node: IText) {
    const operateKey = this.beforeOperate.value! //@ts-ignore
    node.style[operateKey] = this.textStyle.value[operateKey]
    StageDraw.collectRedraw(node.id)
  }
  private setDiff(type: 'inverse' | 'not inverse') {
    const operateKey = this.beforeOperate.value!
    const isContent = operateKey === 'content'
    this.textNodes.forEach((node) => {
      ;(type === 'inverse' ? Diff.setInverseReplacePatch : Diff.setReplacePatch)(
        createNodeDiffPath(node.id, isContent ? [operateKey] : ['style', operateKey]),
        isContent ? node.content : node.style[operateKey]
      )
    })
  }
  private recordOperate(operateDiff: IOperateDiff) {
    if (Record.isInRedoUndo) return
    const operateKey = this.beforeOperate.value!
    const travel = (type: 'undo' | 'redo') => {
      const { diffs, inverseDiffs } = operateDiff
      diffApply(Schema.getSchema(), type === 'undo' ? inverseDiffs : diffs)
      operateKey !== 'content' && this.setupTextStyle()
      this.textNodes.forEach((node) => StageDraw.collectRedraw(node.id))
    }
    Record.push({
      description: '改变textNode属性',
      detail: { type: operateKey },
      undo: () => travel('undo'),
      redo: () => travel('redo'),
    })
  }
}

export const OperateText = new OperateTextService()

function createTextStyleOptions() {
  return {
    align: ['left', 'center', 'right'],
    fontWeight: [
      'normal',
      'bold',
      'bolder',
      'lighter',
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
    ],
  }
}
