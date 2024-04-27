import { Container, Graphics, Stage } from '@pixi/react'
import { FC, memo } from 'react'
import { StageViewport } from '~/editor/stage/viewport'
import { useHookSignal } from '~/shared/signal/signal-react'
import { makeStyles } from '~/view/ui-utility/theme'

type ISceneStageComp = {}

export const SceneStageComp: FC<ISceneStageComp> = memo(({}) => {
  const { classes } = useStyles({})
  const { bound } = StageViewport
  useHookSignal(bound)
  return (
    <Stage
      options={{
        backgroundColor: '#F5F5F5' /* '#F7F8FA' */ /* '#F1F2F6' */,
        antialias: true,
        resolution: window.devicePixelRatio,
        eventMode: 'passive',
        eventFeatures: {
          move: true,
          globalMove: false,
          click: true,
          wheel: true,
        },
      }}>
      <Container>
        <Graphics
          draw={(g) => {
            g.beginFill('red')
            g.drawRect(0, 0, 100, 100)
          }}></Graphics>
      </Container>
    </Stage>
  )
})

type ISceneStageCompStyle = {} /* & Required<Pick<ISceneStageComp>> */ /* & Pick<ISceneStageComp> */

const useStyles = makeStyles<ISceneStageCompStyle>()((t) => ({
  SceneStage: {
    ...t.rect('100%', 30, 'no-radius', 'white'),
  },
}))

SceneStageComp.displayName = 'SceneStageComp'
