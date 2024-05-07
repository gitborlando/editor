import { FC, memo } from 'react'
import { IFillColor } from '~/editor/schema/type'
import { UIPickerCopy } from '~/editor/ui-state/right-panel/operate/picker'
import { getColorFromFill } from '~/shared/utils/color'
import { transition } from '~/shared/utils/react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { PickerColorComp } from './color'

type IPickerSolidComp = {
  fill: IFillColor
}

export const PickerSolidComp: FC<IPickerSolidComp> = memo(({ fill }) => {
  const { classes } = useStyles({})
  const { setFillSolidColor } = UIPickerCopy

  return (
    <Flex layout='v' className={classes.PickerSolid}>
      <PickerColorComp
        color={getColorFromFill(fill)}
        onChange={transition(({ color, alpha }) => setFillSolidColor(color, alpha))}
      />
      <Flex layout='h'>{getColorFromFill(fill)}</Flex>
    </Flex>
  )
})

type IPickerSolidCompStyle =
  {} /* & Required<Pick<IPickerSolidComp>> */ /* & Pick<IPickerSolidComp> */

const useStyles = makeStyles<IPickerSolidCompStyle>()((t) => ({
  PickerSolid: {
    ...t.rect(240, 'fit-content', 'no-radius', 'white'),
  },
}))

PickerSolidComp.displayName = 'PickerSolidComp'
