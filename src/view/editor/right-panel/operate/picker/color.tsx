import { observer } from 'mobx-react'
import { FC, useEffect } from 'react'
import { RgbaStringColorPicker } from 'react-colorful'
import { UIPicker } from '~/editor/ui-state/right-planel/operate/picker'
import { useHookSignal } from '~/shared/signal-react'
import { downUpTracker } from '~/shared/utils/down-up-tracker'
import { makeStyles } from '~/view/ui-utility/theme'

type IPickerColorComp = {}

export const PickerColorComp: FC<IPickerColorComp> = observer(({}) => {
  const { currentSolidFill, beforeOperate, afterOperate } = UIPicker
  const { classes, cx } = useStyles({})
  useHookSignal(currentSolidFill)
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
      color={currentSolidFill.value.color}
      onChange={(c) => currentSolidFill.dispatch((fill) => (fill.color = c))}
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
