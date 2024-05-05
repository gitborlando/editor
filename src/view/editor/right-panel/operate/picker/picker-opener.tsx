import { cloneDeep } from 'lodash-es'
import { FC, memo } from 'react'
import { IFill, IFillColor } from '~/editor/schema/type'
import { UIPickerCopy } from '~/editor/ui-state/right-panel/operate/picker copy'
import { makeLinearGradientCss, rgbToHex, rgbToRgba } from '~/shared/utils/color'
import { IXY, iife, useSubComponent } from '~/shared/utils/normal'
import { XY } from '~/shared/xy'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { CompositeInput } from '~/view/ui-utility/widget/compositeInput'
import { Flex } from '~/view/ui-utility/widget/flex'

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
    UIPickerCopy.xy.value = XY.Of(window.innerWidth - 480 - 10, xy.y - 10)
    UIPickerCopy.show.dispatch(true)
  }
  const { theme, css, classes } = useStyles({})

  const ColorInputComp = useSubComponent<{ fill: IFill }>([fill.type], ({ fill }) => {
    return (
      <CompositeInput
        type='text'
        className='input'
        disabled={!isColorType}
        needStepHandler={false}
        value={iife(() => {
          if (isColorType) return rgbToHex((fill as IFillColor).color)
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

  return (
    <>
      <Flex layout='h' sidePadding={6} className={classes.Fill}>
        <Flex layout='h' className='miniShower' onClick={(e) => showPicker(XY.From(e, 'client'))}>
          <img src={Asset.editor.rightPanel.operate.fill.none}></img>
          {isColorType && (
            <Flex style={{ backgroundColor: rgbToRgba(fill.color, fill.alpha) }}></Flex>
          )}
          {isLinearType && <Flex style={{ background: makeLinearGradientCss(fill) }}></Flex>}
          {/* {isImageType && <img src={currentImage.value.objectUrl}></img>} */}
        </Flex>
        <ColorInputComp fill={fill} />
      </Flex>
      <Flex layout='h' justify='space-between' sidePadding={6} className={classes.opacity}>
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
