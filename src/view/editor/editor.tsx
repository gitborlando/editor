import { FC, memo } from 'react'
import usePromise from 'react-promise-suspense'
import { initEditor } from '~/editor/editor/initialize'
import { Schema } from '~/editor/schema/schema'
import { useHookSignal } from '~/shared/signal/signal-react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { EditorSchemaContext } from './context'
import { HeaderComp } from './header/header'
import { LeftPanelComp } from './left-panel/left-panel'
import { RightPanelComp } from './right-panel/right-panel'
import { MainStageComp } from './stage/stage'

type IEditorComp = {}

export const EditorComp: FC<IEditorComp> = memo(({}) => {
  const { classes } = useStyles({})
  usePromise<[string], any>(initEditor, ['editor-init'])
  useHookSignal(Schema.schemaChanged, { afterAll: true })

  return (
    <Flex layout='v' className={classes.Editor} onContextMenu={(e) => e.preventDefault()}>
      <EditorSchemaContext.Provider value={Schema.schema}>
        <HeaderComp />
        <Flex layout='h' className={classes.main}>
          <LeftPanelComp />
          <MainStageComp />
          <RightPanelComp />
        </Flex>
      </EditorSchemaContext.Provider>
    </Flex>
  )
})

type IEditorCompStyle = {} /* & Required<Pick<IEditorComp>> */ /* & Pick<IEditorComp> */

const useStyles = makeStyles<IEditorCompStyle>()((t) => ({
  Editor: {
    ...t.rect('100vw', '100vh', 'no-radius', 'white'),
    ...t.relative(),
  },
  main: {
    ...t.rect('100%', '100%'),
    overflow: 'hidden',
  },
}))

EditorComp.displayName = 'EditorComp'
