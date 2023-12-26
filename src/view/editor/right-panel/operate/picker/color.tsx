import { observer } from 'mobx-react'
import { FC } from 'react'
import { HexAlphaColorPicker } from 'react-colorful'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'

type IPickerColorComp = {}

export const PickerColorComp: FC<IPickerColorComp> = observer(({}) => {
  const { classes } = useStyles({})
  return (
    <Flex className={classes.PickerColor}>
      <HexAlphaColorPicker className={classes.colorPicker} />
    </Flex>
  )
})

type IPickerColorCompStyle =
  {} /* & Required<Pick<IPickerColorComp>> */ /* & Pick<IPickerColorComp> */

const useStyles = makeStyles<IPickerColorCompStyle>()((t) => ({
  PickerColor: {
    ...t.rect('100%', 'fit-content', 'no-radius', 'white'),
  },
  colorPicker: {
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

PickerColorComp.displayName = 'PickerColorComp'
