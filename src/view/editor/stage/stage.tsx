import { observer } from 'mobx-react'
import { FC } from 'react'
import { useEditor } from '~/view/context'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'

type IStageComp = {}

export const StageComp: FC<IStageComp> = observer(({}) => {
  const { classes } = useStyles({})
  const { Pixi } = useEditor()
  return (
    <Flex
      ref={Pixi.setContainer}
      className={classes.Stage}
      onContextMenu={(e) => e.preventDefault()}></Flex>
  )
})

type IStageCompStyle = {} /* & Required<Pick<IStageComp>> */ /* & Pick<IStageComp> */

const useStyles = makeStyles<IStageCompStyle>()((t) => ({
  Stage: {
    ...t.rect('100%', '100%', 'no-radius', '#EBECED'),
    ...t.relative(0, -0.5),
  },
}))

StageComp.displayName = 'StageComp'
