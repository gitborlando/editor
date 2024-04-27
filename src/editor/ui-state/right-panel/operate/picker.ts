import autobind from 'class-autobind-decorator'
import { IImage, Img } from '~/editor/img'
import { SchemaDefault } from '~/editor/schema/default'
import { IFill, IFillColor, IFillImage, IFillLinearGradient } from '~/editor/schema/type'
import { Signal, createSignal } from '~/shared/signal/signal'
import { IXY, iife } from '~/shared/utils/normal'
import { XY } from '~/shared/xy'

type IOperateType = 'solid-color'

@autobind
export class UIPickerService {
  show = createSignal(false)
  type = createSignal(<'color' | 'linearGradient' | 'image'>'color')
  xy = createSignal(<IXY>XY.Of(0, 0))
  currentFill = createSignal(<IFill>{})
  beforeOperate = createSignal(<{ type: IOperateType }>{})
  afterOperate = createSignal(<{ type: IOperateType; value?: any }>{})
  loadingWebImageUrl = createSignal('')
  currentImage = createSignal(<IImage>{ objectUrl: '' })
  currentIndex = 0
  impact = <'fill' | 'stroke' | 'shadow'>''
  private fillCache = this.createFillCache()
  get currentSolidFill() {
    return this.currentFill as Signal<IFillColor>
  }
  get currentLinearFill() {
    return this.currentFill as Signal<IFillLinearGradient>
  }
  get currentImageFill() {
    return this.currentFill as Signal<IFillImage>
  }
  initHook() {
    this.show.hook((show) => {
      if (show) this.fillCache = this.createFillCache()
    })
    this.type.hook((type) => {
      this.currentFill.dispatch(this.fillCache[type])
    })
    this.currentFill.hook((fill) => {
      //@ts-ignore
      this.fillCache[fill.type] = fill
    })
    this.currentFill.hook({ before: 'fill-comp' }, (fill) => {
      if (fill.type !== 'image') return
      iife(async () => {
        const image = Img.getImage(fill.url)
        if (image) this.currentImage.dispatch(image)
        else this.currentImage.dispatch(await Img.getImageAsync(fill.url))
      })
    })
  }
  private createFillCache() {
    return {
      color: SchemaDefault.fillColor(),
      linearGradient: SchemaDefault.fillLinearGradient(),
      image: SchemaDefault.fillImage(),
    }
  }
}

export const UIPicker = new UIPickerService()
