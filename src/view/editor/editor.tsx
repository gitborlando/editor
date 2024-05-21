import { FC, memo } from 'react'
import usePromise from 'react-promise-suspense'
import { initEditor } from '~/editor/editor/initialize'
import { Schema } from '~/editor/schema/schema'
import { useHookSignal } from '~/shared/signal/signal-react'
import { Flex } from '~/view/ui-utility/widget/flex'
import { HeaderComp } from './header/header'
import { LeftPanelComp } from './left-panel/left-panel'
import { RightPanelComp } from './right-panel/right-panel'
import { MainStageComp } from './stage/stage'

type IEditorComp = {}

export const EditorComp: FC<IEditorComp> = memo(({}) => {
  usePromise<[string], any>(initEditor, ['editor-init'])
  useHookSignal(Schema.schemaChanged, { afterAll: true })

  return (
    <Flex
      className='lay-v wh-100vw-100vh bg-white relative'
      onContextMenu={(e) => e.preventDefault()}>
      <HeaderComp />
      <Flex className='lay-h wh-100% of-hidden'>
        <LeftPanelComp />
        <MainStageComp />
        <RightPanelComp />
      </Flex>
    </Flex>
  )
})
