import { observer } from 'mobx-react'
import { FC } from 'react'
import { useEditor } from '~/ui/context'
import { makeStyles } from '~/ui/theme'
import { Flex } from '~/ui/widget/flex'
import { PageComp } from './page/page'

type ILeftPanelComp = {}

export const LeftPanelComp: FC<ILeftPanelComp> = observer(({}) => {
  const { stage } = useEditor()
  const { classes } = useStyles({ left: stage.bound.left })
  return (
    <Flex layout='v' className={classes.LeftPanel}>
      <PageComp />
    </Flex>
  )
})

type ILeftPanelCompStyle = {
  left: number
} /* & Required<Pick<ILeftPanelComp>> */ /* & Pick<ILeftPanelComp> */

const useStyles = makeStyles<ILeftPanelCompStyle>()((t, { left }) => ({
  LeftPanel: {
    ...t.rect(left, '100%'),
    flexShrink: 0,
    flexGrow: 0,
  },
}))

LeftPanelComp.displayName = 'LeftPanelComp'
