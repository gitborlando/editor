import { FC, memo } from 'react'
import { RgbaStringColorPicker } from 'react-colorful'
import { makeStyles } from '~/view/ui-utility/theme'

type IPickerColorComp = {
  color: string
  onChange: (color: string) => void
}

export const PickerColorComp: FC<IPickerColorComp> = memo(({ color, onChange }) => {
  const { classes, cx } = useStyles({})

  return <RgbaStringColorPicker className={classes.colorPicker} color={color} onChange={onChange} />
})

type IPickerColorCompStyle =
  {} /* & Required<Pick<IPickerColorComp>> */ /* & Pick<IPickerColorComp> */

const useStyles = makeStyles<IPickerColorCompStyle>()((t) => ({
  PickerColor: {
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

PickerColorComp.displayName = 'PickerColorComp'
