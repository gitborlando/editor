import { observer } from 'mobx-react'
import { FC, createElement } from 'react'
import { StageViewport } from '~/editor/stage/viewport'
import { UILeftPanel } from '~/editor/ui-state/left-panel/left-panel'
import { useHookSignal } from '~/shared/signal-react'
import { iife } from '~/shared/utils/normal'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { PopupPanelComp } from './popup'
import { SwitchBarComp } from './switch-bar'

type ILeftPanelComp = {}

export const LeftPanelComp: FC<ILeftPanelComp> = observer(({}) => {
  const { showLeftPanel, currentTabId, switchTabMap, popupTabIds, switchTabIds } = UILeftPanel
  const { classes } = useStyles({ left: StageViewport.bound.value.x })
  useHookSignal(showLeftPanel)
  useHookSignal(currentTabId)
  useHookSignal(popupTabIds)
  return (
    <Flex shrink={0} layout='h' className={classes.LeftPanel}>
      <SwitchBarComp />
      <Flex layout='v' vshow={showLeftPanel.value} className={classes.panels}>
        {createElement(
          iife(() => {
            if (!popupTabIds.value.has(currentTabId.value)) {
              return switchTabMap.value.get(currentTabId.value)
            }
            const id = switchTabIds.find(
              (id) => id !== currentTabId.value && !popupTabIds.value.has(id)
            )!
            return switchTabMap.value.get(id)
          })!.panel
        )}
      </Flex>
      {[...popupTabIds.value].map((id) => (
        <PopupPanelComp key={id} id={id} />
      ))}
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
