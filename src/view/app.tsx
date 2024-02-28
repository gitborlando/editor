import { observer } from 'mobx-react'
import { FC, Suspense } from 'react'
import { initApp } from '~/global/initialize'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { UploaderComp } from './component/uploader'
import { EditorComp } from './editor/editor'

initApp()

type IAppProps = {}

export const App: FC<IAppProps> = observer(() => {
  const { classes } = useStyles({})
  return (
    <Flex layout='v' className={classes.App} onContextMenu={(e) => e.preventDefault()}>
      <Suspense fallback={'加载中...'}>
        <EditorComp />
      </Suspense>
      {/* <MenuComp /> */}
      <UploaderComp />
    </Flex>
  )
})

type IAppStyleProps = {} /* & Required<Pick<IAppProps>> */ /* & Pick<IAppProps> */

const useStyles = makeStyles<IAppStyleProps>()((t) => ({
  App: {
    ...t.rect('100vw', '100vh', 'no-radius', 'white'),
  },
}))

App.displayName = 'App'
