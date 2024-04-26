import { observer } from 'mobx-react'
import { FC } from 'react'
import { Pixi } from '~/editor/stage/pixi'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'

type IStageComp = {}

export const MainStageComp: FC<IStageComp> = observer(({}) => {
  const { classes } = useStyles({})
  return (
    <Flex
      shrink={0}
      ref={Pixi.setContainer}
      className={classes.Stage}
      onContextMenu={(e) => e.preventDefault()}>
      {/* <SceneStageComp /> */}
    </Flex>
  )
})

type IStageCompStyle = {} /* & Required<Pick<IStageComp>> */ /* & Pick<IStageComp> */

const useStyles = makeStyles<IStageCompStyle>()((t) => ({
  Stage: {
    ...t.rect('100%', '100%', 'no-radius', 'white'),
    ...t.relative(0, -0.5),
  },
}))

MainStageComp.displayName = 'StageComp'
