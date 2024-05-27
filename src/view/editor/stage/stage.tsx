import { Container, Stage, useApp } from '@pixi/react'
import { Application } from 'pixi.js'
import { FC } from 'react'
import { Schema } from 'src/editor/schema/schema'
import { Pixi } from 'src/editor/stage/pixi'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { useMemoComp } from 'src/shared/utils/react'
import { SchemaUtil } from 'src/shared/utils/schema'
import { Flex } from 'src/view/ui-utility/widget/flex'
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
  useHookSignal(Schema.inited)

  const AppRefComp = useMemoComp([], ({}) => {
    Pixi.setApp(useApp())
    return null
  })

  const SceneStageComp = useMemoComp([Schema.inited.value], ({}) => {
    const children = SchemaUtil.getChildren(Schema.client.selectPageId)
    useHookSignal(Schema.schemaChanged)

    return (
      <Container ref={Pixi.setSceneStage}>
        {/* {useRenderChildren(children)} */}
        <HoverComp />
        <TransformComp />
        <MarqueeComp />
        <VectorEditComp />
      </Container>
    )
  })

  return (
    <Flex
      ref={Pixi.setHtmlContainer}
      className='wh-100% bg-white shrink-0 relative left-0 -top-0.5'
      onContextMenu={(e) => e.preventDefault()}>
      <Stage options={staticOption} raf={false} renderOnComponentChange={true}>
        <AppRefComp />
        <SceneStageComp />
        <RulerComp />
      </Stage>
      {/* <CursorsComp /> */}
    </Flex>
  )
}
