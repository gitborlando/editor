import { Container } from '@pixi/react'
import { FC } from 'react'
import { Schema } from '~/editor/schema/schema'
import { SchemaUtil } from '~/editor/schema/util'
import { Pixi } from '~/editor/stage/pixi'
import { useRenderChildren } from './hooks'
import { HoverComp } from './widget/hover'
import { TransformComp } from './widget/transform'

type ISceneStageComp = {}

export const SceneStageComp: FC<ISceneStageComp> = ({}) => {
  const children = SchemaUtil.getChildren(Schema.client.selectPageId)

  return (
    <Container ref={Pixi.setSceneStage}>
      {useRenderChildren(children)}
      <HoverComp />
      <TransformComp />
    </Container>
  )
}

SceneStageComp.displayName = 'SceneStageComp'
