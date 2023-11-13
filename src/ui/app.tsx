import { observer } from 'mobx-react'
import { FC } from 'react'
import { EditorService } from '~/service/editor/editor'
import { EditorContext } from './context'
import { EditorComp } from './feature/editor'
import { makeStyles } from './theme'
import { Flex } from './widget/flex'

interface IAppProps {}

export const App: FC<IAppProps> = observer(() => {
  const { classes } = useStyles({})
  const editor = new EditorService()
  return (
    <Flex layout='v' className={classes.App}>
      <Flex id='dragMask' vshow={editor.drag.canMove} className={classes.dragMask}></Flex>
      <EditorContext.Provider value={editor}>
        <EditorComp />
      </EditorContext.Provider>
    </Flex>
  )
})

type IAppStyleProps = {} /* & Required<Pick<IAppProps>> */ /* & Pick<IAppProps> */

const useStyles = makeStyles<IAppStyleProps>()((t) => ({
  App: {
    ...t.rect('100vw', '100vh', 'no-radius', 'white'),
  },
  dragMask: {
    ...t.rect('100vw', '100vh', 'no-radius', 'rgba(0,0,0,0)'),
    ...t.fixed(0, 0),
    zIndex: 2,
  },
}))

App.displayName = 'App'
