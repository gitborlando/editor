import { cloneDeep } from 'lodash-es'
import { FC, memo } from 'react'
import usePromise from 'react-promise-suspense'
import rgbHex from 'rgb-hex'
import { IImage, Img } from '~/editor/editor/img'
import { xy_, xy_client } from '~/editor/math/xy'
import { IFill, IFillColor } from '~/editor/schema/type'
import { UIPickerCopy } from '~/editor/ui-state/right-panel/operate/picker'
import { useAutoSignal } from '~/shared/signal/signal-react'
import { makeLinearGradientCss, rgbToRgba } from '~/shared/utils/color'
import { IXY, iife } from '~/shared/utils/normal'
import { useMemoComp, withSuspense } from '~/shared/utils/react'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { CompositeInput } from '~/view/ui-utility/widget/compositeInput'
import { Flex } from '~/view/ui-utility/widget/flex'
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
  const { theme, css, classes, cx } = useStyles({})

  const ColorInputComp = useMemoComp<{ fill: IFill }>([fill], ({ fill }) => {
    return (
      <CompositeInput
        type='text'
        className='input'
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
    const image = usePromise<[string], IImage>(() => Img.getImageAsync(url), [url])
    const imageBound = iife(() => {
      const { width, height } = image
      const rate = width / height
      return rate > 1 ? { width: 18, height: 18 / rate } : { width: 18 * rate, height: 18 }
    })
    return <img src={image.objectUrl} style={{ ...imageBound }}></img>
  })

  return (
    <>
      <Flex layout='h' className={cx(classes.Fill, 'px-6')}>
        <Flex layout='h' className='miniShower' onClick={(e) => showPicker(xy_client(e))}>
          <img src={Asset.editor.rightPanel.operate.fill.none}></img>
          {isColorType && (
            <Flex style={{ backgroundColor: rgbToRgba(fill.color, fill.alpha) }}></Flex>
          )}
          {isLinearType && <Flex style={{ background: makeLinearGradientCss(fill) }}></Flex>}
          {isImageType && withSuspense(<ImgComp url={fill.url} />)}
        </Flex>
        <ColorInputComp fill={fill} />
      </Flex>
      <Flex layout='h' justify='space-between' className={cx(classes.opacity, 'px-6')}>
        <CompositeInput
          type='number'
          needStepHandler={false}
          className='opacity'
          value={Number(fill.alpha * 100).toFixed(0)}
          beforeOperate={() => setupUIPicker()}
          onNewValueApply={(value) => {
            // currentFill.dispatch((fill) => {
            //   ;(fill as IFillColor).alpha = Number(value) / 100
            // })
          }}
        />
        <Flex layout='c' className={css({ ...theme.labelFont })}>
          %
        </Flex>
      </Flex>
      {isShowPicker.value && <PickerComp fill={fill} show={isShowPicker} />}
    </>
  )
})

type IPickerOpenerStyle = {} /* & Required<Pick<IPickerOpener>> */ /* & Pick<IPickerOpener> */

const useStyles = makeStyles<IPickerOpenerStyle>()((t) => ({
  Fill: {
    ...t.rect(92, 28, 2),
    ...t.default$.hover.background,
    // ...t.default$.background,
    ...t.default$.font.normal,
    marginRight: 4,
    '& .miniShower': {
      ...t.rect(18, 18, 2),
      ...t.relative(),
      marginRight: 6,
      cursor: 'pointer',
      '& div, img': {
        ...t.rect('100%', '100%', 2),
        ...t.absolute(),
      },
    },
    '& .input': {
      ...t.default$.input,
      width: 54,
      textAlign: 'center',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  },
  opacity: {
    ...t.rect(54, 28, 2),
    // ...t.default$.hover.border,
    ...t.default$.hover.background,
    '& .opacity': {
      width: 34,
      ...t.default$.input,
    },
  },
}))

PickerOpener.displayName = 'PickerOpener'
