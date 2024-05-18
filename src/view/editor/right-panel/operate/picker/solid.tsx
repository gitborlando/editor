import { FC, memo, useTransition } from 'react'
import { IFillColor } from '~/editor/schema/type'
import { UIPickerCopy } from '~/editor/ui-state/right-panel/operate/picker'
import { getColorFromFill } from '~/shared/utils/color'
import { Flex } from '~/view/ui-utility/widget/flex'
import { PickerColorComp } from './color'

type IPickerSolidComp = {
  fill: IFillColor
}

export const PickerSolidComp: FC<IPickerSolidComp> = memo(({ fill }) => {
  const { setFillSolidColor } = UIPickerCopy
  const transition = useTransition()[1]

  return (
    <Flex className='lay-v wh-240-fit bg-white'>
      <PickerColorComp
        color={getColorFromFill(fill)}
        onChange={({ color, alpha }) => transition(() => setFillSolidColor(color, alpha))}
      />
    </Flex>
  )
})
