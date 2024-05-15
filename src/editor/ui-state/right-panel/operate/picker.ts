import autobind from 'class-autobind-decorator'
import { xy_ } from '~/editor/math/xy'
import { IFill, IFillKeys } from '~/editor/schema/type'
import Immui, { ImmuiPatch } from '~/shared/immui/immui'
import { createSignal } from '~/shared/signal/signal'
import { IXY } from '~/shared/utils/normal'

type IOperateType = 'solid-color'

@autobind
class UIPickerService {
  fill!: IFill
  show = createSignal(false)
  type = createSignal(<'color' | 'linearGradient' | 'image'>'color')
  xy = createSignal(<IXY>xy_(0, 0))
  beforeOperate = createSignal(<{ type: IOperateType }>{})
  afterOperate = createSignal(<{ type: IOperateType; value?: any }>{})
  loadingWebImageUrl = createSignal('')
  from = <'fill' | 'stroke' | 'shadow'>''
  index = 0
  onChange = createSignal<ImmuiPatch[]>()
  private immui = new Immui()
  initHook() {
    this.onChange.intercept((patches) => {
      return patches.map((patch) => ({ ...patch, path: patch.path.slice(2) }))
    })
  }
  setFill(keys: IFillKeys[], value: any) {
    this.immui.reset([this.fill], [0, ...keys], value)
  }
  changeFill(newFill: IFill) {
    this.immui.reset([this.fill], [0], newFill)
    this.emitChange()
    this.afterOperate.dispatch()
  }
  setFillSolidColor(color: string, alpha: number) {
    this.setFill(['color'], color)
    this.setFill(['alpha'], alpha)
    this.emitChange()
  }
  setStopColor(index: number, color: string, alpha: number) {
    this.setFill(['stops', index, 'color'], color)
    this.setFill(['stops', index, 'alpha'], alpha)
    this.emitChange()
  }
  setFillUrl(url: string) {
    this.setFill(['url'], url)
    this.emitChange()
    this.afterOperate.dispatch()
  }
  emitChange() {
    this.onChange.dispatch(this.immui.commitPatches())
  }
}

export const UIPickerCopy = new UIPickerService()
