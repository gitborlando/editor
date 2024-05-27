import { cloneDeep } from 'lodash-es'
import { FC, memo, useEffect } from 'react'
import { SchemaDefault } from 'src/editor/schema/default'
import { IFill, IFillColor, IFillImage, IFillLinearGradient } from 'src/editor/schema/type'
import { StageWidgetTransform } from 'src/editor/stage/widget/transform'
import { UIPickerCopy } from 'src/editor/ui-state/right-panel/operate/picker'
import { Signal } from 'src/shared/signal/signal'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { useMemoComp } from 'src/shared/utils/react'
import { DraggableComp } from 'src/view/component/draggable'
import { Button } from 'src/view/ui-utility/widget/button'
import { Flex } from 'src/view/ui-utility/widget/flex'
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
      <Flex className='lay-v wh-240-fit bg-white'>
        <Flex className='lay-h justify-around wh-100%-fit py-4'>
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
