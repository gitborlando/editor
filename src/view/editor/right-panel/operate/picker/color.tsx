import { FC, memo } from 'react'
import { RgbaStringColorPicker } from 'react-colorful'
import { UIPickerCopy } from '~/editor/ui-state/right-panel/operate/picker copy'
import { rgb } from '~/shared/utils/color'
import { useDownUpTracker } from '~/shared/utils/down-up-tracker'
import { makeStyles } from '~/view/ui-utility/theme'

type IPickerColorComp = {
  color: string
  onChange: (color: { color: string; alpha: number }) => void
}

export const PickerColorComp: FC<IPickerColorComp> = memo(({ color, onChange }) => {
  const { classes } = useStyles({})
  const { beforeOperate, afterOperate } = UIPickerCopy
  const transformColor = (color: string) => {
    const [, r, g, b, a] = color.match(/rgba\((\d+), (\d+), (\d+), (\d+(\.\d+)?)\)/)!
    return { color: rgb(r, g, b), alpha: Number(a) }
  }
  useDownUpTracker(
    () => document.getElementById('$$RgbaStringColorPicker'),
    beforeOperate.dispatch,
    afterOperate.dispatch
  )

  return (
    <RgbaStringColorPicker
      id='$$RgbaStringColorPicker'
      className={classes.colorPicker}
      color={color}
      onChange={(c) => onChange(transformColor(c))}
    />
  )
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
