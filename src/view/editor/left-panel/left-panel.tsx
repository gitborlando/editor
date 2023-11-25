import { observer } from 'mobx-react'
import { FC } from 'react'
import { useServices } from '~/ioc'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { PageComp } from './page/page'

type ILeftPanelComp = {}

export const LeftPanelComp: FC<ILeftPanelComp> = observer(({}) => {
  const { viewportService } = useServices()
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
