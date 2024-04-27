import { FC, memo } from 'react'
import { UIPicker } from '~/editor/ui-state/right-panel/operate/picker'
import { useAutoSignal, useHookSignal } from '~/shared/signal/signal-react'
import { makeLinearGradientCss } from '~/shared/utils/color'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { PickerColorComp } from './color'

type IPickerLinearGradientComp = {}

export const PickerLinearGradientComp: FC<IPickerLinearGradientComp> = memo(({}) => {
  const { classes } = useStyles({})
  const { currentLinearFill } = UIPicker
  const { stops } = currentLinearFill.value
  const currentStop = useAutoSignal(stops[0])
  useHookSignal(currentLinearFill)

  const StopsBar: FC<{}> = () => {
    return (
      <Flex layout='h' shrink={0} className={classes.stopsBar}>
        <Flex
          className='bar'
          style={{ background: makeLinearGradientCss(currentLinearFill.value) }}></Flex>
        {stops.map((stop, index) => (
          <Flex
            key={index}
            className='stop'
            style={{
              backgroundColor: `${stop.color}`,
              border: '2px solid white',
              left: `${stop.offset * 100}%`,
              ...(currentStop.value === stop && { transform: 'scale(1.4, 1.4)' }),
            }}
            onClick={() => {
              currentStop.dispatch(stop)
            }}></Flex>
        ))}
      </Flex>
    )
  }

  return (
    <Flex layout='v' className={classes.PickerLinearGradient}>
      <StopsBar />
      <PickerColorComp
        color={currentStop.value.color}
        onChange={(color) => {
          currentStop.value.color = color
          currentLinearFill.dispatch()
        }}
      />
    </Flex>
  )
})

type IPickerLinearGradientCompStyle =
  {} /* & Required<Pick<IPickerLinearGradientComp>> */ /* & Pick<IPickerLinearGradientComp> */

const useStyles = makeStyles<IPickerLinearGradientCompStyle>()((t) => ({
  PickerLinearGradient: {
    ...t.rect(240, 'fit-content', 'no-radius', 'white'),
  },
  stopsBar: {
    ...t.rect(200, 20, 99),
    position: 'relative',
    '& .bar': {
      ...t.rect(200, 10, 99),
    },
    '& .stop': {
      ...t.rect(12, 12, 99),
      ...t.cursor('pointer'),
      position: 'absolute',
      boxShadow: '0 0 3px 0px rgba(0,0,0,0.7), inset 0 0 5px -2px rgba(0,0,0,0.7)',
    },
  },
}))

PickerLinearGradientComp.displayName = 'PickerLinearGradientComp'
