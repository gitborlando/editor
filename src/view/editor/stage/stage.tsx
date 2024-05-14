import { Container, Stage, useApp } from '@pixi/react'
import { Application } from 'pixi.js'
import { FC } from 'react'
import { Schema } from '~/editor/schema/schema'
import { SchemaUtil } from '~/editor/schema/util'
import { Pixi } from '~/editor/stage/pixi'
import { useHookSignal } from '~/shared/signal/signal-react'
import { useMemoSubComponent, useSubComponent } from '~/shared/utils/normal'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { EditorSchemaContext } from '../context'
import { useRenderChildren } from './hooks'
import { CooperationComp } from './widget/cooperation'
import { CursorsComp } from './widget/cursors'
import { HoverComp } from './widget/hover'
import { MarqueeComp } from './widget/marquee'
import { RulerComp } from './widget/ruler'
import { TransformComp } from './widget/transform'
import { VectorEditComp } from './widget/vector-edit'

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
  useHookSignal(Schema.inited)

  const AppRefComp = useMemoSubComponent([], ({}) => {
    Pixi.setApp(useApp())
    return null
  })

  const SceneStageComp = useSubComponent([], ({}) => {
    const children = SchemaUtil.getChildren(Schema.client.selectPageId)
    return (
      <Container ref={Pixi.setSceneStage}>
        {useRenderChildren(children)}
        <HoverComp />
        <TransformComp />
        <MarqueeComp />
        <CooperationComp />
        <VectorEditComp />
      </Container>
    )
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
              <RulerComp />
            </EditorSchemaContext.Provider>
          </Stage>
        )}
      </EditorSchemaContext.Consumer>
      <CursorsComp />
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
