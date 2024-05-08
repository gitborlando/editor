import { observer } from 'mobx-react'
import { FC } from 'react'
import { commands } from '~/editor/editor/command'
import { UILeftPanel } from '~/editor/ui-state/left-panel/left-panel'
import { Menu } from '~/global/menu'
import { useHookSignal } from '~/shared/signal/signal-react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Button } from '~/view/ui-utility/widget/button'
import { Flex } from '~/view/ui-utility/widget/flex'

type ISwitchBarComp = {}

export const SwitchBarComp: FC<ISwitchBarComp> = observer(({}) => {
  const { showLeftPanel, currentTabId, switchTabMap, popupTabIds } = UILeftPanel
  const { switchTabIds, findSwitchTab } = UILeftPanel
  const { classes, cx } = useStyles({})
  useHookSignal(currentTabId)
  useHookSignal(popupTabIds)
  useHookSignal(switchTabMap)
  return (
    <Flex shrink={0} layout='v' className={classes.SwitchBar}>
      <Flex layout='v' className={classes.group}>
        {switchTabIds
          .filter((id) => !popupTabIds.value.has(id))
          .map((id) => {
            const tab = findSwitchTab(id)
            return (
              <Button
                key={id}
                active={currentTabId.value === id}
                className={cx(classes.tab)}
                onClick={() => currentTabId.dispatch(id)}
                onDoubleClick={() => showLeftPanel.dispatch(!showLeftPanel.value)}
                onContextMenu={() => {
                  const { UIleftPanelSwitchBarGroup } = commands
                  Menu.context = { id }
                  Menu.menuOptions.dispatch([UIleftPanelSwitchBarGroup])
                }}>
                {/* <Icon size={20}>{tab.icon}</Icon> */}
                <h4>{tab.name}</h4>
              </Button>
            )
          })}
      </Flex>
      {/* <Flex layout='v' style={{ gap: 4, marginTop: 'auto' }}>
        <Divide direction='h' length={'50%'} />
        <Button onClick={() => popUpPanel(currentTabId.value)}>
          <Icon size={16} scale={0.9}>
            {Asset.editor.leftPanel.switchBar.popup}
          </Icon>
        </Button>
        <Button onClick={() => showLeftPanel.dispatch(!showLeftPanel.value)}>
          <Icon size={16}>{Asset.editor.leftPanel.switchBar.toLeft}</Icon>
        </Button>
      </Flex> */}
    </Flex>
  )
})

type ISwitchBarCompStyle = {} /* & Required<Pick<ISwitchBarComp>> */ /* & Pick<ISwitchBarComp> */

const useStyles = makeStyles<ISwitchBarCompStyle>()((t) => ({
  SwitchBar: {
    ...t.rect(40, '100%', 'no-radius', 'white'),
    ...t.default$.border('right'),
    backgroundColor: 'white',
    paddingBlock: 8,
  },
  group: {
    ...t.rect('100%', 'fit-content'),
    gap: 10,
  },
  tab: {
    // ...t.rect('100%', 'fit-content'),
    // ...t.labelFont,
    // paddingBlock: 10,
    // '&.active': {
    //   ...t.default$.active.background,
    // },
  },
}))

SwitchBarComp.displayName = 'SwitchBarComp'
