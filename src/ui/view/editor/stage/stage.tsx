import { observer } from 'mobx-react'
import { FC } from 'react'
import { Stage } from 'react-konva'
import { useEditor } from '~/ui/context'
import { makeStyles } from '~/ui/theme'
import { Flex } from '~/ui/widget/flex'

type IStageComp = {}

export const StageComp: FC<IStageComp> = observer(({}) => {
  const { classes } = useStyles({})
  const { stage } = useEditor()
  return (
    <Flex className={classes.Stage} style={{ cursor: stage.cursor }}>
      <Stage ref={stage.setInstance} width={stage.bound.width} height={stage.bound.height} />
    </Flex>
  )
})

type IStageCompStyle = {} /* & Required<Pick<IStageComp>> */ /* & Pick<IStageComp> */

const useStyles = makeStyles<IStageCompStyle>()((t) => ({
  Stage: {
    ...t.rect('100%', '100%', 'no-radius', '#EBECED'),
  },
}))

StageComp.displayName = 'StageComp'
