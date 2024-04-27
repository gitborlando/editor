import { observer } from 'mobx-react'
import { FC } from 'react'
import { StageViewport } from '~/editor/stage/viewport'
import { UIRightPanel } from '~/editor/ui-state/right-panel/right-panel'
import { useHookSignal } from '~/shared/signal/signal-react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { OperatePanelComp } from './operate/operate-panel'

type IRightPanelComp = {}

export const RightPanelComp: FC<IRightPanelComp> = observer(({}) => {
  const { classes } = useStyles({ right: StageViewport.bound.value.right })
  const { currentTab } = UIRightPanel
  useHookSignal(currentTab)
  return (
    <Flex layout='v' className={classes.RightPanel}>
      {currentTab.value === 'operate' && <OperatePanelComp />}
    </Flex>
  )
})

type IRightPanelCompStyle = {
  right: number
} /* & Required<Pick<IRightPanelComp>> */ /* & Pick<IRightPanelComp> */

const useStyles = makeStyles<IRightPanelCompStyle>()((t, { right }) => ({
  RightPanel: {
    ...t.rect(right, '100%'),
    marginLeft: 'auto',
  },
}))

RightPanelComp.displayName = 'RightPanelComp'
