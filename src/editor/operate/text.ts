import autobind from 'class-autobind-decorator'
import { createSignal, mergeSignal } from '~/shared/signal/signal'
import { Schema } from '../schema/schema'
import { IText } from '../schema/type'
import { StageDraw2 } from '../stage/draw/draw'
import { StageSelect } from '../stage/interact/select'
import { OperateNode } from './node'

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
class OperateTextService {
  textStyle = createSignal(<IBaseStyle>createBaseStyle())
  beforeOperate = createSignal<ITextStyleKey | 'content' | null>()
  afterOperate = createSignal()
  intoEditing = createSignal<IText | null>(null)
  textNodes = <IText[]>[]
  textStyleOptions = createTextStyleOptions()
  initHook() {
    StageSelect.afterSelect.hook(() => {
      this.textNodes = OperateNode.selectedNodes.value.filter((node) => {
        return node.type === 'text'
      }) as IText[]
      if (!this.textNodes.length) return
      this.setupTextStyle()
    })
    this.textStyle.hook((_, args) => {
      if (args?.isSetupCause) return
      this.textNodes.forEach((node) => OperateNode.collectDirty(node.id))
    })
    OperateNode.duringFlushDirty.hook((id) => {
      const node = Schema.find(id)
      if (node.type !== 'text') return
      this.applyChange(node)
    })
    mergeSignal(OperateNode.afterFlushDirty, this.afterOperate).hook(() => {
      const operateKey = this.beforeOperate.value!
      const changeDescription = operateKey === 'content' ? '改变 text content' : '改变 text style'
      Schema.commitOperation(changeDescription)
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
    this.beforeOperate.dispatch(key) //@ts-ignore
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
    this.textStyle.dispatch(undefined, { isSetupCause: true })
  }
  private applyChange(node: IText) {
    const operateKey = this.beforeOperate.value! //@ts-ignore
    Schema.itemReset(node, ['style', operateKey], this.textStyle.value[operateKey])
    StageDraw2.collectRedraw(node.id)
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
