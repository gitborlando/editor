import { observer } from 'mobx-react'
import { FC } from 'react'
import { useEditor } from '~/view/context'
import { makeStyles } from '~/view/ui-utility/theme'

type IStageComp = {}

export const StageComp: FC<IStageComp> = observer(({}) => {
  const { classes } = useStyles({})
  const { CK, StageViewport } = useEditor()
  const { width, height } = StageViewport.bound
  return (
    <canvas
      id='mainCanvas'
      ref={CK.setRef}
      className={classes.Stage}
      width={width}
      height={height}
      style={{ width, height }}
      onContextMenu={(e) => e.preventDefault()}></canvas>
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
