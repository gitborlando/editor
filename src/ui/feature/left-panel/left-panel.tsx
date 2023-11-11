import { observer } from 'mobx-react'
import { FC } from 'react'
import { editor } from '~/service/editor/editor'
import { makeStyles } from '~/ui/theme'
import { Flex } from '~/ui/widget/flex'
import { PageComp } from './page/page'

type ILeftPanelComp = {}

export const LeftPanelComp: FC<ILeftPanelComp> = observer(({}) => {
  const { classes } = useStyles({})
  return (
    <Flex layout='v' className={classes.LeftPanel}>
      <PageComp />
    </Flex>
  )
})

type ILeftPanelCompStyle = {} /* & Required<Pick<ILeftPanelComp>> */ /* & Pick<ILeftPanelComp> */

const useStyles = makeStyles<ILeftPanelCompStyle>()((t) => ({
  LeftPanel: {
    ...t.rect(editor.stage.bound.left, '100%'),
    flexShrink: 0,
    flexGrow: 0,
  },
  s: {
    backgroundColor: 'red',
  },
}))

LeftPanelComp.displayName = 'LeftPanelComp'
