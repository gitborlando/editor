import { observer } from 'mobx-react'
import { FC, createElement } from 'react'
import { StageViewport } from '~/editor/stage/viewport'
import { UILeftPanel } from '~/editor/ui-state/left-panel/left-panel'
import { useHookSignal } from '~/shared/signal-react'
import { DraggableComp } from '~/view/component/draggable'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '~/view/ui-utility/widget/icon'
import { SwitchBarComp } from './switch-bar/switch-bar'

type ILeftPanelComp = {}

export const LeftPanelComp: FC<ILeftPanelComp> = observer(({}) => {
  const { showLeftPanel, currentTabId, switchTabMap, popDownPanel, popupTabIds, findSwitchTab } =
    UILeftPanel
  const { classes } = useStyles({ left: StageViewport.bound.value.x })
  useHookSignal(showLeftPanel)
  useHookSignal(currentTabId)
  useHookSignal(popupTabIds)
  return (
    <Flex shrink={0} layout='h' className={classes.LeftPanel}>
      <SwitchBarComp />
      <Flex layout='v' vshow={showLeftPanel.value} className={classes.panels}>
        {createElement(switchTabMap.value.get(currentTabId.value)!.panel)}
      </Flex>
      {[...popupTabIds.value].map((id) => {
        const { name, panel, icon } = findSwitchTab(id)
        return (
          <DraggableComp
            key={id}
            headerSlot={
              <Flex layout='h' style={{ gap: 4 }}>
                <Icon size={18}>{icon}</Icon>
                <h4>{name}</h4>
              </Flex>
            }
            closeFunc={() => popDownPanel(id)}
            xy={{ x: window.innerWidth - 480, y: 100 }}
            width={240}
            height={840}>
            {createElement(panel)}
          </DraggableComp>
        )
      })}
    </Flex>
  )
})

type ILeftPanelCompStyle = {
  left: number
} /* & Required<Pick<ILeftPanelComp>> */ /* & Pick<ILeftPanelComp> */

const useStyles = makeStyles<ILeftPanelCompStyle>()((t, { left }) => ({
  LeftPanel: {
    ...t.rect(left, '100%'),
    flexGrow: 0,
  },
  panels: {
    ...t.rect(240, '100%'),
    flexGrow: 0,
  },
}))

LeftPanelComp.displayName = 'LeftPanelComp'
