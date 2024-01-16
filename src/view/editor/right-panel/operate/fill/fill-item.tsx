import { observer } from 'mobx-react'
import { FC } from 'react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'

type IFillItemComp = {}

export const FillItemComp: FC<IFillItemComp> = observer(({}) => {
  const { classes } = useStyles({})
  return <Flex className={classes.FillItem}></Flex>
})

type IFillItemCompStyle = {} /* & Required<Pick<IFillItemComp>> */ /* & Pick<IFillItemComp> */

const useStyles = makeStyles<IFillItemCompStyle>()((t) => ({
  FillItem: {
    ...t.rect('100%', 30, 'no-radius', 'white'),
  },
}))

FillItemComp.displayName = 'FillItemComp'
