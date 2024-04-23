import { FC, memo, useEffect } from 'react'
import { RgbaStringColorPicker } from 'react-colorful'
import { UIPicker } from '~/editor/ui-state/right-planel/operate/picker'
import { downUpTracker } from '~/shared/utils/down-up-tracker'
import { makeStyles } from '~/view/ui-utility/theme'

type IPickerColorComp = {
  color: string
  onChange: (color: string) => void
}

export const PickerColorComp: FC<IPickerColorComp> = memo(({ color, onChange }) => {
  const { beforeOperate, afterOperate } = UIPicker
  const { classes, cx } = useStyles({})
  useEffect(() => {
    return downUpTracker(
      document.getElementById('colorPicker$$$')!,
      () => beforeOperate.dispatch({ type: 'solid-color' }),
      () => afterOperate.dispatch({ type: 'solid-color' })
    )
  }, [])
  return (
    <RgbaStringColorPicker
      id='colorPicker$$$'
      className={classes.colorPicker}
      color={color}
      onChange={onChange}
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
