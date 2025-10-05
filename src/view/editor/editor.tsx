import { Flex } from '@gitborlando/widget'
import { FC, memo } from 'react'
import { Editor } from 'src/editor/editor/editor'
import { Schema } from 'src/editor/schema/schema'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { Loading } from 'src/view/component/loading'
import { suspense } from 'src/view/component/suspense'
import { StageComp } from 'src/view/editor/stage/stage'
import { suspend } from 'suspend-react'
import { HeaderComp } from './header/header'
import { LeftPanelComp } from './left-panel/left-panel'
import { RightPanelComp } from './right-panel/right-panel'

type IEditorComp = {}

export const EditorComp: FC<IEditorComp> = suspense(
  memo(({}) => {
    const { fileId } = useParams<{ fileId: string }>()
    useMemo(() => Editor.initEditor(), [])
    suspend(() => Editor.initSchema(fileId!), [fileId])
    useHookSignal(Schema.schemaChanged, { afterAll: true })

    return (
      <Flex layout='v' className='wh-100vw-100vh bg-white relative'>
        <HeaderComp />
        <Flex layout='h' className='wh-100% of-hidden'>
          <LeftPanelComp />
          <StageComp />
          <RightPanelComp />
        </Flex>
      </Flex>
    )
  }),
  <Loading />,
)
