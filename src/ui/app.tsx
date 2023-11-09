import { observer } from 'mobx-react'
import { FC } from 'react'
import { EditorComp } from './feature/editor'
import { makeStyles } from './theme'
import { Flex } from './widget/flex'

interface IAppProps {}

export const App: FC<IAppProps> = observer(() => {
  const { classes } = useStyles({})
  return (
    <Flex layout='v' className={classes.App}>
      <EditorComp />
    </Flex>
  )
})

type IAppStyleProps = {} /* & Required<Pick<IAppProps>> */ /* & Pick<IAppProps> */

const useStyles = makeStyles<IAppStyleProps>()((t) => ({
  App: {
    ...t.rect('100vw', '100vh'),
  },
}))

App.displayName = 'App'
