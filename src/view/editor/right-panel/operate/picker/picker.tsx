import { Signal } from '@gitborlando/signal'
import { Flex } from '@gitborlando/widget'
import { FC, memo, useEffect } from 'react'
import { UIPickerCopy } from 'src/editor/handle/picker'
import { SchemaCreator } from 'src/editor/schema/creator'
import {
  IFill,
  IFillColor,
  IFillImage,
  IFillLinearGradient,
} from 'src/editor/schema/type'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { clone } from 'src/shared/utils/normal'
import { useMemoComp } from 'src/shared/utils/react'
import { DraggableComp } from 'src/view/component/draggable'
import { Button } from 'src/view/ui-utility/widget/button'
import { PickerImageComp } from './image'
import { PickerLinearGradientComp } from './linear'
import { PickerSolidComp } from './solid'

const createFillCache = () => ({
  color: SchemaCreator.fillColor(),
  linearGradient: SchemaCreator.fillLinearGradient(),
  image: SchemaCreator.fillImage(),
})
let fillCache = createFillCache()

type IPickerComp = {
  fill: IFill
  show: Signal<boolean>
}

export const PickerComp: FC<IPickerComp> = memo(({ fill, show }) => {
  const { type, xy, changeFill } = UIPickerCopy

  useEffect(() => {
    UIPickerCopy.fill = clone(fill)
  }, [fill])

  useEffect(() => {
    //@ts-ignore
    fillCache[fill.type] = fill
    return () => void (fillCache = createFillCache())
  }, [show.value, fill])

  useHookSignal(type, () => {
    changeFill(fillCache[type.value])
  })

  // useEffect(() => {
  //   StageTransform.show.dispatch(false)
  //   return () => void StageTransform.show.dispatch(true)
  // })

  const ButtonComp = useMemoComp<{ fillType: IFill['type']; label: string }>(
    [type.value],
    ({ fillType, label }) => {
      return (
        <Button
          active={type.value === fillType}
          onClick={() => type.dispatch(fillType)}>
          {label}
        </Button>
      )
    },
  )

  return (
    <DraggableComp
      headerSlot={<h6>颜色</h6>}
      closeFunc={() => show.dispatch(false)}
      clickAwayClose={() => show.value}
      xy={xy.value}>
      <Flex layout='v' className='wh-240-fit bg-white'>
        <Flex layout='h' className='justify-around wh-100%-fit py-4'>
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
