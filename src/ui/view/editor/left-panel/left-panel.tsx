import { observer } from 'mobx-react'
import { FC } from 'react'
import { useService } from '~/ui/context'
import { makeStyles } from '~/ui/theme'
import { Flex } from '~/ui/widget/flex'
import { PageComp } from './page/page'

type ILeftPanelComp = {}

export const LeftPanelComp: FC<ILeftPanelComp> = observer(({}) => {
  const { viewportService } = useService()
  const { classes } = useStyles({ left: viewportService.bound.x })
  return (
    <Flex layout='v' className={classes.LeftPanel}>
      <PageComp />
      {/* <ShapeComp /> */}
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
