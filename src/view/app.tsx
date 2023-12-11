import { observer } from 'mobx-react'
import { FC } from 'react'
import ReactDOM from 'react-dom/client'
import { testDraw2 } from '~/helper/test2'
import { editorServices } from '~/ioc'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { EditorContext } from './context'
import { EditorComp } from './editor/editor'

type IAppProps = {}

const customMode = false

export const App: FC<IAppProps> = observer(() => {
  const { classes, cx } = useStyles({})
  return (
    <Flex layout='v' className={classes.App}>
      {customMode ? (
        <canvas
          ref={(cvs) => testDraw2(cvs!.getContext('2d')!)}
          className={classes.canvas}
          width={1000}
          height={1000}></canvas>
      ) : (
        <EditorContext.Provider value={editorServices}>
          <EditorComp />
        </EditorContext.Provider>
      )}
    </Flex>
  )
})

type IAppStyleProps = {} /* & Required<Pick<IAppProps>> */ /* & Pick<IAppProps> */

const useStyles = makeStyles<IAppStyleProps>()((t) => ({
  App: {
    ...t.rect('100vw', '100vh', 'no-radius', 'white'),
  },
  canvas: {
    width: 1200,
    height: 1200,
    border: '1px solid black',
  },
}))

App.displayName = 'App'

export const renderApp = () => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)
}
