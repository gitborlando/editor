import { FC, memo, useState } from 'react'
import { IFillLinearGradient } from '~/editor/schema/type'
import { UIPickerCopy } from '~/editor/ui-state/right-panel/operate/picker'
import { makeLinearGradientCss } from '~/shared/utils/color'
import { Flex } from '~/view/ui-utility/widget/flex'
import { PickerColorComp } from './color'

type IPickerLinearGradientComp = {
  fill: IFillLinearGradient
}

export const PickerLinearGradientComp: FC<IPickerLinearGradientComp> = memo(({ fill }) => {
  const { setStopColor } = UIPickerCopy
  const [stopIndex, setStopIndex] = useState(0)

  const StopsBar: FC<{}> = () => {
    return (
      <Flex className='lay-h shrink-0 wh-200-20-99 relative'>
        <Flex className='wh-200-10-99' style={{ background: makeLinearGradientCss(fill) }}></Flex>
        {fill.stops.map((stop, index) => (
          <Flex
            key={index}
            className='wh-12-12-99 pointer absolute b-2-white'
            style={{
              backgroundColor: `${stop.color}`,
              left: `${stop.offset * 100}%`,
              boxShadow: '0 0 3px 0px rgba(0,0,0,0.7), inset 0 0 5px -2px rgba(0,0,0,0.7)',
              ...(stopIndex === index && { transform: 'scale(1.4, 1.4)' }),
            }}
            onClick={() => setStopIndex(index)}></Flex>
        ))}
      </Flex>
    )
  }

  return (
    <Flex className='lay-v wh-240-fit bg-white'>
      <StopsBar />
      <PickerColorComp
        color={fill.stops[stopIndex].color}
        onChange={({ color, alpha }) => setStopColor(stopIndex, color, alpha)}
      />
    </Flex>
  )
})
