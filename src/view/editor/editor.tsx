import { observer } from 'mobx-react'
import { FC } from 'react'
import usePromise from 'react-promise-suspense'
import { initEditor } from '~/editor/init-editor'
import { Drag } from '~/global/drag'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { HeaderComp } from './header/header'
import { LeftPanelComp } from './left-panel/left-panel'
import { RightPanelComp } from './right-panel/right-panel'
import { StageComp } from './stage/stage'

type IEditorComp = {}

export const EditorComp: FC<IEditorComp> = observer(({}) => {
  const { classes } = useStyles({})
  usePromise<[string], any>(initEditor, ['editor-init'])
  return (
    <Flex layout='v' className={classes.Editor} onContextMenu={(e) => e.preventDefault()}>
      <HeaderComp />
      <Flex layout='h' className={classes.main}>
        <LeftPanelComp />
        <StageComp />
        <RightPanelComp />
      </Flex>
      <Flex
        className={classes.dragMask}
        vshow={Drag.canMove && false}
        style={{
          cursor: Drag.cursor,
        }}></Flex>
    </Flex>
  )
})

type IEditorCompStyle = {} /* & Required<Pick<IEditorComp>> */ /* & Pick<IEditorComp> */

const useStyles = makeStyles<IEditorCompStyle>()((t) => ({
  Editor: {
    ...t.rect('100vw', '100vh', 'no-radius', 'white'),
  },
  main: {
    ...t.rect('100%', '100%'),
  },
  dragMask: {
    ...t.rect('100vw', '100vh', 'no-radius', 'rgba(0,0,0,0)'),
    ...t.fixed(0, 0),
    zIndex: 999,
  },
}))

EditorComp.displayName = 'EditorComp'
