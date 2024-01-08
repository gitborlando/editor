import { observer } from 'mobx-react'
import { FC } from 'react'
import { StageViewport } from '~/editor/stage/viewport'
import { UILeftPanel } from '~/editor/ui-state/left-panel/left-panel'
import { useHookSignal } from '~/shared/signal-react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { LayerComp } from './panels/layer/layer'
import { SwitchBarComp } from './switch-bar/switch-bar'

type ILeftPanelComp = {}

export const LeftPanelComp: FC<ILeftPanelComp> = observer(({}) => {
  const { switchTag, switchBarPosition } = UILeftPanel
  const { classes } = useStyles({ left: StageViewport.bound.value.x })
  useHookSignal(switchTag)
  useHookSignal(switchBarPosition)
  return (
    <Flex layout={switchBarPosition.value === 'top' ? 'v' : 'h'} className={classes.LeftPanel}>
      <SwitchBarComp />
      <Flex layout='v' className={classes.panels}>
        {switchTag.value === 'layer' && <LayerComp />}
      </Flex>
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
  panels: {
    ...t.rect(240, '100%'),
  },
}))

LeftPanelComp.displayName = 'LeftPanelComp'
