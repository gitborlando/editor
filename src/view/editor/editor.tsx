import { FC, memo } from 'react'
import usePromise from 'react-promise-suspense'
import { Editor } from 'src/editor/editor/editor'
import { Schema } from 'src/editor/schema/schema'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { useMemoComp, withSuspense } from 'src/shared/utils/react'
import { StageComp } from 'src/view/editor/stage/stage'
import { Flex } from 'src/view/ui-utility/widget/flex'
import { HeaderComp } from './header/header'
import { LeftPanelComp } from './left-panel/left-panel'
import { RightPanelComp } from './right-panel/right-panel'

type IEditorComp = {}

export const EditorComp: FC<IEditorComp> = memo(({}) => {
  const ContentComp = useMemoComp([], ({}) => {
    usePromise<[string], any>(Editor.initEditor, ['editor-init'])
    useHookSignal(Schema.schemaChanged, { afterAll: true })

    return (
      <Flex className='lay-v wh-100vw-100vh bg-white relative'>
        <HeaderComp />
        <Flex className='lay-h wh-100% of-hidden'>
          <LeftPanelComp />
          <StageComp />
          <RightPanelComp />
        </Flex>
      </Flex>
    )
  })

  return withSuspense(<ContentComp />, '加载中...')
})
