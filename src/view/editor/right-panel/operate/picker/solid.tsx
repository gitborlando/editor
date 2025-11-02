import { Flex } from '@gitborlando/widget'
import { FC, memo } from 'react'
import { UIPickerCopy } from 'src/editor/handle/picker'
import { IFillColor } from 'src/editor/schema/type'
import { getColorFromFill } from 'src/shared/utils/color'
import { PickerColorComp } from './color'

type IPickerSolidComp = {
  fill: IFillColor
}

export const PickerSolidComp: FC<IPickerSolidComp> = memo(({ fill }) => {
  const { setFillSolidColor } = UIPickerCopy

  return (
    <Flex layout='v' className='wh-240-fit bg-white'>
      <PickerColorComp
        color={getColorFromFill(fill)}
        onChange={({ color, alpha }) => setFillSolidColor(color, alpha)}
      />
    </Flex>
  )
})
