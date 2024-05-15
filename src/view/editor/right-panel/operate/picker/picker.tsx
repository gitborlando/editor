import { cloneDeep } from 'lodash-es'
import { FC, memo, useEffect } from 'react'
import { SchemaDefault } from '~/editor/schema/default'
import { IFill, IFillColor, IFillImage, IFillLinearGradient } from '~/editor/schema/type'
import { StageWidgetTransform } from '~/editor/stage/widget/transform'
import { UIPickerCopy } from '~/editor/ui-state/right-panel/operate/picker'
import { Signal } from '~/shared/signal/signal'
import { useHookSignal } from '~/shared/signal/signal-react'
import { useMemoComp } from '~/shared/utils/react'
import { DraggableComp } from '~/view/component/draggable'
import { makeStyles } from '~/view/ui-utility/theme'
import { Button } from '~/view/ui-utility/widget/button'
import { Flex } from '~/view/ui-utility/widget/flex'
import { PickerImageComp } from './image'
import { PickerLinearGradientComp } from './linear'
import { PickerSolidComp } from './solid'

const createFillCache = () => ({
  color: SchemaDefault.fillColor(),
  linearGradient: SchemaDefault.fillLinearGradient(),
  image: SchemaDefault.fillImage(),
})
let fillCache = createFillCache()

type IPickerComp = {
  fill: IFill
  show: Signal<boolean>
}

export const PickerComp: FC<IPickerComp> = memo(({ fill, show }) => {
  const { classes } = useStyles({})
  const { type, xy, changeFill } = UIPickerCopy

  useEffect(() => {
    UIPickerCopy.fill = cloneDeep(fill)
  }, [fill])

  useEffect(() => {
    //@ts-ignore
    fillCache[fill.type] = fill
    return () => void (fillCache = createFillCache())
  }, [show.value, fill])

  useHookSignal(type, () => {
    changeFill(fillCache[type.value])
  })

  useEffect(() => {
    StageWidgetTransform.needDraw.dispatch(false)
    return () => void StageWidgetTransform.needDraw.dispatch(true)
  })

  const ButtonComp = useMemoComp<{ fillType: IFill['type']; label: string }>(
    [type.value],
    ({ fillType, label }) => {
      return (
        <Button active={type.value === fillType} onClick={() => type.dispatch(fillType)}>
          {label}
        </Button>
      )
    }
  )

  return (
    <DraggableComp
      headerSlot={<h6>颜色</h6>}
      closeFunc={() => show.dispatch(false)}
      clickAwayClose={() => show.value}
      xy={xy.value}>
      <Flex layout='v' className={classes.Picker} style={{}}>
        <Flex layout='h' className={classes.typeSwitcher} justify={'space-around'}>
          <ButtonComp fillType='color' label='颜色' />
          <ButtonComp fillType='linearGradient' label='线性' />
          <ButtonComp fillType='image' label='图片' />
        </Flex>
        {fill.type === 'color' && <PickerSolidComp fill={fill as IFillColor} />}
        {fill.type === 'linearGradient' && (
          <PickerLinearGradientComp fill={fill as IFillLinearGradient} />
        )}
        {fill.type === 'image' && <PickerImageComp fill={fill as IFillImage} />}
      </Flex>
    </DraggableComp>
  )
})

type IPickerCompStyle = {} /* & Required<Pick<IPickerComp>> */ /* & Pick<IPickerComp> */

const useStyles = makeStyles<IPickerCompStyle>()((t) => ({
  Picker: {
    ...t.rect(240, 'fit-content', 5, 'white'),
  },
  header: {
    ...t.rect('100%', 'fit-content'),
    ...t.default$.borderBottom,
  },
  typeSwitcher: {
    ...t.rect('100%', 'fit-content'),
    paddingBlock: 4,
  },
}))

PickerComp.displayName = 'PickerComp'
