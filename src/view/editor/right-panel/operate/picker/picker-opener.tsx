import { cloneDeep } from 'lodash-es'
import { FC, memo } from 'react'
import usePromise from 'react-promise-suspense'
import rgbHex from 'rgb-hex'
import { IImage, ImgManager } from 'src/editor/editor/img'
import { xy_, xy_client } from 'src/editor/math/xy'
import { IFill, IFillColor } from 'src/editor/schema/type'
import { UIPickerCopy } from 'src/editor/ui-state/right-panel/operate/picker'
import { useAutoSignal } from 'src/shared/signal/signal-react'
import { makeLinearGradientCss, rgbToRgba } from 'src/shared/utils/color'
import { IXY, iife } from 'src/shared/utils/normal'
import { useMemoComp, withSuspense } from 'src/shared/utils/react'
import Asset from 'src/view/ui-utility/assets'
import { CompositeInput } from 'src/view/ui-utility/widget/compositeInput'
import { Flex } from 'src/view/ui-utility/widget/flex'
import { PickerComp } from './picker'

type IPickerOpener = {
  fill: IFill
  index: number
  impact: typeof UIPickerCopy.from
}

export const PickerOpener: FC<IPickerOpener> = memo(({ fill, index, impact }) => {
  const isColorType = fill.type === 'color'
  const isLinearType = fill.type === 'linearGradient'
  const isImageType = fill.type === 'image'
  const setupUIPicker = () => {
    UIPickerCopy.type.value = fill.type
    UIPickerCopy.from = impact
    UIPickerCopy.index = index
    UIPickerCopy.fill = cloneDeep(fill)
  }
  const showPicker = (xy: IXY) => {
    setupUIPicker()
    UIPickerCopy.xy.value = xy_(window.innerWidth - 480 - 10, xy.y - 10)
    isShowPicker.dispatch(true)
  }
  const isShowPicker = useAutoSignal(false)

  const ColorInputComp = useMemoComp<{ fill: IFill }>([fill], ({ fill }) => {
    return (
      <CompositeInput
        type='text'
        className='d-input w-56 text-align-center'
        disabled={!isColorType}
        needStepHandler={false}
        value={iife(() => {
          if (isColorType) return rgbHex((fill as IFillColor).color)
          if (isLinearType) return '线性渐变'
          if (isImageType) return '图片填充'
          return ''
        })}
        onNewValueApply={(value) => {
          // currentFill.dispatch((fill) => {
          //   ;(fill as IFillColor).color = hexToRgb(value)
          // })
        }}
        beforeOperate={() => setupUIPicker()}
      />
    )
  })

  const ImgComp = useMemoComp<{ url: string }>([], ({ url }) => {
    const image = usePromise<[string], IImage>(() => ImgManager.getImageAsync(url), [url])
    const imageBound = iife(() => {
      const { width, height } = image
      const rate = width / height
      return rate > 1 ? { width: 18, height: 18 / rate } : { width: 18 * rate, height: 18 }
    })
    return <img src={image.objectUrl} style={{ ...imageBound }}></img>
  })

  return (
    <>
      <Flex className='lay-h wh-92-28-2 d-hover-bg normalFont px-6'>
        <Flex
          className='lay-h wh-18-18-2 relative mr-4 pointer [&_div]:(wh-100%-100%-2 absolute) [&_img]:(wh-100%-100%-2 absolute)'
          onClick={(e) => showPicker(xy_client(e))}>
          <img src={Asset.editor.rightPanel.operate.fill.none}></img>
          {isColorType && (
            <Flex style={{ backgroundColor: rgbToRgba(fill.color, fill.alpha) }}></Flex>
          )}
          {isLinearType && <Flex style={{ background: makeLinearGradientCss(fill) }}></Flex>}
          {isImageType && withSuspense(<ImgComp url={fill.url} />)}
        </Flex>
        <ColorInputComp fill={fill} />
      </Flex>
      <Flex className='lay-h space-between px-6 wh-54-28-2 d-hover-bg'>
        <CompositeInput
          type='number'
          needStepHandler={false}
          className='width-34 d-input'
          value={Number(fill.alpha * 100).toFixed(0)}
          beforeOperate={() => setupUIPicker()}
          onNewValueApply={(value) => {
            // currentFill.dispatch((fill) => {
            //   ;(fill as IFillColor).alpha = Number(value) / 100
            // })
          }}
        />
        <Flex className='lay-c labelFont'>%</Flex>
      </Flex>
      {isShowPicker.value && <PickerComp fill={fill} show={isShowPicker} />}
    </>
  )
})
