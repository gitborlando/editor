import { observer } from 'mobx-react'
import { FC } from 'react'
import { testDraw } from '~/helper/test-draw'

import { makeStyles } from './theme'
import { EditorComp } from './view/editor/editor'
import { Flex } from './widget/flex'

interface IAppProps {}

const customMode = false

export const App: FC<IAppProps> = observer(() => {
  const { classes } = useStyles({})
  return (
    <Flex layout='v' className={classes.App}>
      {customMode ? (
        <canvas
          ref={(cvs) => testDraw(cvs!.getContext('2d')!)}
          className={classes.canvas}
          width={1000}
          height={1000}></canvas>
      ) : (
        <EditorComp />
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
    width: 1000,
    height: 1000,
    border: '1px solid black',
  },
}))

App.displayName = 'App'
