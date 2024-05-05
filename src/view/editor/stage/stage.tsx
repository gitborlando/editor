import { Stage, useApp } from '@pixi/react'
import { Application } from 'pixi.js'
import { FC } from 'react'
import { Schema } from '~/editor/schema/schema'
import { Pixi } from '~/editor/stage/pixi'
import { StageViewport } from '~/editor/stage/viewport'
import { useHookSignal } from '~/shared/signal/signal-react'
import { useMemoSubComponent } from '~/shared/utils/normal'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { EditorSchemaContext } from '../context'
import { SceneStageComp } from './scene-stage'

const staticOption: ConstructorParameters<typeof Application>[0] = {
  backgroundColor: 0xf5f5f5 /* '#F7F8FA' */ /* '#F1F2F6' */,
  antialias: true,
  resolution: window.devicePixelRatio,
  eventMode: 'passive',
  eventFeatures: {
    move: true,
    globalMove: false,
    click: true,
    wheel: true,
  },
}

type IStageComp = {}

export const MainStageComp: FC<IStageComp> = ({}) => {
  const { classes } = useStyles({})
  const { bound } = StageViewport
  useHookSignal(Schema.inited)
  useHookSignal(bound)

  const AppRefComp = useMemoSubComponent([], ({}) => {
    Pixi.setApp(useApp())
    return null
  })

  return (
    <Flex
      shrink={0}
      ref={Pixi.setHtmlContainer}
      className={classes.Stage}
      onContextMenu={(e) => e.preventDefault()}>
      <EditorSchemaContext.Consumer>
        {(schema) => (
          <Stage options={staticOption} raf={false} renderOnComponentChange={true}>
            <EditorSchemaContext.Provider value={schema}>
              <AppRefComp />
              <SceneStageComp />
            </EditorSchemaContext.Provider>
          </Stage>
        )}
      </EditorSchemaContext.Consumer>
    </Flex>
  )
}

type IStageCompStyle = {} /* & Required<Pick<IStageComp>> */ /* & Pick<IStageComp> */

const useStyles = makeStyles<IStageCompStyle>()((t) => ({
  Stage: {
    ...t.rect('100%', '100%', 'no-radius', 'white'),
    ...t.relative(0, -0.5),
  },
}))

MainStageComp.displayName = 'StageComp'
