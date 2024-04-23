import { FC } from 'react'
import { UIPicker } from '~/editor/ui-state/right-planel/operate/picker'
import { useHookSignal } from '~/shared/signal-react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { PickerColorComp } from './color'

type IPickerSolidComp = {}

export const PickerSolidComp: FC<IPickerSolidComp> = ({}) => {
  const { classes } = useStyles({})
  const { currentSolidFill } = UIPicker
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
  useHookSignal(currentSolidFill)

  return (
    <Flex layout='v' className={classes.PickerSolid}>
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
