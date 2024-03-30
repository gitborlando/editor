import { FC, memo } from 'react'
import { OperateFill } from '~/editor/operate/fill'
import { IFill } from '~/editor/schema/type'
import { UIPicker } from '~/editor/ui-state/right-planel/operate/picker'
import { useHookSignal } from '~/shared/signal-react'
import { XY } from '~/shared/structure/xy'
import { rgbToHex } from '~/shared/utils/color'
import { IXY } from '~/shared/utils/normal'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { InputComp } from '~/view/ui-utility/widget/input'

type IFillComp = {
  fill: IFill
  index: number
  impact: typeof UIPicker.impact
}

export const FillComp: FC<IFillComp> = memo(({ fill, index, impact }) => {
  const isColorType = fill.type === 'color'
  const isImageType = fill.type === 'image'
  const showPicker = (xy: IXY, type: typeof UIPicker.type.value) => {
    UIPicker.xy.value = XY.Of(window.innerWidth - 480 - 10, xy.y - 10)
    UIPicker.type.value = type
    UIPicker.impact = impact
    UIPicker.show.dispatch(true)
  }
  const { currentFill, currentImage } = UIPicker
  const { theme, css, classes } = useStyles({})

  useHookSignal(
    currentFill,
    (_, f) => {
      if (UIPicker.impact === impact) f()
    },
    ['id:fill-comp']
  )
  useHookSignal(OperateFill.fills)

  return (
    <>
      <Flex layout='h' sidePadding={4} className={classes.Fill}>
        <Flex
          layout='h'
          className='opener'
          onClick={(e) => {
            UIPicker.currentIndex = index
            currentFill.dispatch(fill)
            showPicker(XY.From(e, 'client'), currentFill.value.type)
          }}>
          <img src={Asset.editor.rightPanel.operate.fill.none}></img>
          {isColorType && (
            <Flex
              className={css({
                ...theme.rect(18, 18, 4, fill.color),
                ...theme.absolute(),
              })}></Flex>
          )}
          {isImageType && <img src={currentImage.value.objectUrl}></img>}
        </Flex>
        <InputComp
          type='text'
          className='input'
          style={{ marginLeft: 'auto' }}
          value={isColorType ? rgbToHex(fill.color) : fill.type}
        />
      </Flex>
      <Flex layout='h' sidePadding={4} className={classes.opacity}>
        <InputComp type='number' className='opacity' value={100} />
        <Flex layout='c' className={css({ ...theme.labelFont })}>
          %
        </Flex>
      </Flex>
    </>
  )
})

type IFillCompStyle = {} /* & Required<Pick<IFillComp>> */ /* & Pick<IFillComp> */

const useStyles = makeStyles<IFillCompStyle>()((t) => ({
  Fill: {
    ...t.rect('fit-content', 24, 4),
    ...t.default$.hover.background,
    marginRight: 8,
    paddingInline: 4,
    '& .opener': {
      ...t.rect(18, 18, 4),
      ...t.relative(),
      cursor: 'pointer',
    },
    '& img': {
      ...t.rect(18, 18, 4),
      ...t.absolute(),
    },
    '& .input': {
      ...t.default$.input,
      ...t.labelFont,
      width: 48,
      textAlign: 'center',
    },
  },
  opacity: {
    ...t.rect('fit-content', 24, 4),
    ...t.default$.hover.background,
    paddingInline: 6,
    '& .opacity': {
      width: 24,
      ...t.default$.input,
      ...t.labelFont,
    },
  },
}))

FillComp.displayName = 'FillComp'
