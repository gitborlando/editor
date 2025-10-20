import { FC, memo } from 'react'
import { Editor } from 'src/editor/editor/editor'
import { Schema } from 'src/editor/schema/schema'
import { Surface } from 'src/editor/stage/render/surface'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { Loading } from 'src/view/component/loading'
import { suspense } from 'src/view/component/suspense'
import { StageComp } from 'src/view/editor/stage/stage'
import { useUnmount } from 'src/view/hooks/common'
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
    suspend(() => Surface.initTextBreaker(), ['initTextBreaker'])

    useHookSignal(Schema.schemaChanged, { afterAll: true })

    useUnmount(() => {
      Editor.inited$.value = false
      YState.inited$.value = false
    })

    return (
      <G vertical='auto 1fr' gap={0}>
        <HeaderComp />
        <G horizontal='auto 1fr auto' gap={0}>
          <LeftPanelComp />
          <StageComp />
          <RightPanelComp />
        </G>
      </G>
    )
  }),
  <Loading />,
)
