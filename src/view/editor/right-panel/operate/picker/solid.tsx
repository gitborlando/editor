import { FC, useRef } from 'react'
import { UIPicker } from '~/editor/ui-state/right-panel/operate/picker'
import { useHookSignal, useSignal } from '~/shared/signal/signal-react'
import { useDownUpTracker } from '~/shared/utils/down-up-tracker'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { PickerColorComp } from './color'

type IPickerSolidComp = {}

export const PickerSolidComp: FC<IPickerSolidComp> = ({}) => {
  const { classes } = useStyles({})
  const ref = useRef<HTMLDivElement>(null)
  const { currentSolidFill, beforeOperate, afterOperate } = UIPicker
  const onChange = (color: string) => {
    const [, r, g, b, a] = color.match(/rgba\((\d+), (\d+), (\d+), (\d+(\.\d+)?)\)/)!
    currentSolidFill.dispatch((fill) => {
      fill.color = `rgb(${r}, ${g}, ${b})`
      fill.alpha = Number(a)
    })
  }
  const getColor = () => {
    const { color, alpha } = currentSolidFill.value
    return color.replace('rgb', 'rgba').replace(')', `,${alpha})`)
  }
  const lastColor = useSignal(getColor())
  useDownUpTracker(
    () => ref.current,
    () => {
      beforeOperate.dispatch({ type: 'solid-color' })
    },
    () => {
      if (lastColor.value === getColor()) return
      afterOperate.dispatch({ type: 'solid-color' })
      lastColor.value = getColor()
    }
  )
  useHookSignal(currentSolidFill)

  return (
    <Flex layout='v' ref={ref} className={classes.PickerSolid}>
      <PickerColorComp color={getColor()} onChange={onChange} />
      <Flex layout='h'>{getColor()}</Flex>
    </Flex>
  )
}

type IPickerSolidCompStyle =
  {} /* & Required<Pick<IPickerSolidComp>> */ /* & Pick<IPickerSolidComp> */

const useStyles = makeStyles<IPickerSolidCompStyle>()((t) => ({
  PickerSolid: {
    ...t.rect(240, 'fit-content', 'no-radius', 'white'),
  },
}))

PickerSolidComp.displayName = 'PickerSolidComp'
