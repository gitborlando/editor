import autobind from 'class-autobind-decorator'
import { IImage, Img } from '~/editor/img'
import { recordSignalContext } from '~/editor/record'
import { SchemaDefault } from '~/editor/schema/default'
import { IFill, IFillColor, IFillImage } from '~/editor/schema/type'
import { StageSelect } from '~/editor/stage/interact/select'
import { Signal, createSignal } from '~/shared/signal'
import { XY } from '~/shared/structure/xy'
import { IXY, iife } from '~/shared/utils/normal'

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
  impact = <'fill' | 'stroke'>''
  get currentSolidFill() {
    return this.currentFill as Signal<IFillColor>
  }
  get currentImageFill() {
    return this.currentFill as Signal<IFillImage>
  }
  initHook() {
    StageSelect.afterClearSelect.hook(() => {
      this.show.dispatch(false)
    })
    this.currentFill.hook(
      (fill) => {
        if (fill.type !== 'image') return
        iife(async () => {
          const image = Img.getImage(fill.url)
          if (image) this.currentImage.dispatch(image)
          else this.currentImage.dispatch(await Img.getImageAsync(fill.url))
        })
      },
      ['before:fill-comp']
    )
    this.type.hook(() => {
      this.autoChangeFillType()
    })
  }
  private autoChangeFillType() {
    const fill = iife(() => {
      const type = this.type.value
      if (type === 'color') return SchemaDefault.fillColor()
      if (type === 'image') return SchemaDefault.fillImage()
    })
    this.currentFill.dispatch(fill)
  }
  private recordCurrentFill() {
    if (recordSignalContext()) return
  }
}

export const UIPicker = new UIPickerService()
