import { observer } from 'mobx-react'
import { FC } from 'react'
import { UIPicker } from '~/editor/ui-state/right-planel/operate/picker'
import { useHookSignal } from '~/shared/signal-react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { PickerColorComp } from './color'

type IPickerSolidComp = {}

export const PickerSolidComp: FC<IPickerSolidComp> = observer(({}) => {
  const { classes } = useStyles({})
  const { currentSolidFill } = UIPicker
  useHookSignal(currentSolidFill)
  return (
    <Flex layout='v' className={classes.PickerSolid}>
      <PickerColorComp />
      <Flex layout='h'>{currentSolidFill.value.color}</Flex>
    </Flex>
  )
})

type IPickerSolidCompStyle =
  {} /* & Required<Pick<IPickerSolidComp>> */ /* & Pick<IPickerSolidComp> */

const useStyles = makeStyles<IPickerSolidCompStyle>()((t) => ({
  PickerSolid: {
    ...t.rect(240, 'fit-content', 'no-radius', 'white'),
  },
  colorPicker: {
    '&.react-colorful': {
      width: 240,
      height: 240,
    },
    '& .react-colorful__pointer': {
      width: 12,
      height: 12,
    },
    '& .react-colorful__alpha, .react-colorful__hue': {
      height: 12,
    },
    '& .react-colorful__last-control, .react-colorful__saturation': {
      borderRadius: 0,
    },
  },
}))

PickerSolidComp.displayName = 'PickerSolidComp'
