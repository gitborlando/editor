import autoBind from 'auto-bind'
import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react'
import { FC } from 'react'
import { Stage } from 'react-konva'
import { editor } from '~/service/editor/editor'
import { makeStyles } from '~/ui/theme'
import { Flex } from '~/ui/widget/flex'

type IStageComp = {}

export const StageComp: FC<IStageComp> = observer(({}) => {
  const { classes } = useStyles({})
  return (
    <Flex className={classes.Stage} style={{ cursor: editor.stage.cursor }}>
      <Stage
        ref={(ref) => editor.stage.setInstance(ref!)}
        width={editor.stage.bound.width}
        height={editor.stage.bound.height}
        //style={{ border: '1px solid red' }}
      />
    </Flex>
  )
})

const StageState = new (class {
  public constructor() {
    autoBind(this)
    makeAutoObservable(this)
  }
})()

type IStageCompStyle = {} /* & Required<Pick<IStageComp>> */ /* & Pick<IStageComp> */

const useStyles = makeStyles<IStageCompStyle>()((t) => ({
  Stage: {
    ...t.rect('100%', '100%', 'no-radius', '#EBECED'),
  },
}))

StageComp.displayName = 'StageComp'
