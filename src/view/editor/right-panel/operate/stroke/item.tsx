import { FC, memo } from 'react'
import { IStroke } from '~/editor/schema/type'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { FillComp } from '../fill-comp'

type IStrokeItemComp = {
  stroke: IStroke
  index: number
}

export const StrokeItemComp: FC<IStrokeItemComp> = memo(({ stroke, index }) => {
  const { classes } = useStyles({})
  return (
    <Flex className={classes.StrokeItem}>
      <FillComp fill={stroke.fill} index={0} />
    </Flex>
  )
})

type IStrokeItemCompStyle = {} /* & Required<Pick<IStrokeItemComp>> */ /* & Pick<IStrokeItemComp> */

const useStyles = makeStyles<IStrokeItemCompStyle>()((t) => ({
  StrokeItem: {
    ...t.rect('100%', 'fit-content'),
    marginTop: 8,
  },
}))

StrokeItemComp.displayName = 'StrokeItemComp'
