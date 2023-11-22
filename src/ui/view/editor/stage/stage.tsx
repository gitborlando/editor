import { observer } from 'mobx-react'
import { FC } from 'react'
import { useService } from '~/ui/context'
import { makeStyles } from '~/ui/theme'
import { Flex } from '~/ui/widget/flex'

type IStageComp = {}

export const StageComp: FC<IStageComp> = observer(({}) => {
  const { classes } = useStyles({})
  const { pixiService } = useService()
  return <Flex ref={pixiService.setContainer} className={classes.Stage}></Flex>
})

type IStageCompStyle = {} /* & Required<Pick<IStageComp>> */ /* & Pick<IStageComp> */

const useStyles = makeStyles<IStageCompStyle>()((t) => ({
  Stage: {
    ...t.rect('100%', '100%', 'no-radius', '#EBECED'),
    ...t.relative(0, -0.5),
  },
}))

StageComp.displayName = 'StageComp'
