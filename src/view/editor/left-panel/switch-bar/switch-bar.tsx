import { FC, memo } from 'react'
import { editorCommands } from '~/editor/editor/command'
import { UILeftPanel } from '~/editor/ui-state/left-panel/left-panel'
import { Menu } from '~/global/menu'
import { useHookSignal } from '~/shared/signal/signal-react'
import { Button } from '~/view/ui-utility/widget/button'
import { Flex } from '~/view/ui-utility/widget/flex'

type ISwitchBarComp = {}

export const SwitchBarComp: FC<ISwitchBarComp> = memo(({}) => {
  const { showLeftPanel, currentTabId, switchTabMap, popupTabIds } = UILeftPanel
  const { switchTabIds, findSwitchTab } = UILeftPanel
  useHookSignal(currentTabId)
  useHookSignal(popupTabIds)
  useHookSignal(switchTabMap)

  return (
    <Flex className='lay-v shrink-0 wh-40-100% bg-white b-1-#E3E3E3-r py-8'>
      <Flex className='lay-v wh-100%-fit gap-10-10'>
        {switchTabIds
          .filter((id) => !popupTabIds.value.has(id))
          .map((id) => {
            const tab = findSwitchTab(id)
            return (
              <Button
                key={id}
                active={currentTabId.value === id}
                onClick={() => currentTabId.dispatch(id)}
                onDoubleClick={() => showLeftPanel.dispatch(!showLeftPanel.value)}
                onContextMenu={() => {
                  const { UIleftPanelSwitchBarGroup } = editorCommands
                  Menu.context = { id }
                  Menu.menuOptions.dispatch([UIleftPanelSwitchBarGroup])
                }}>
                <h4>{tab.name}</h4>
              </Button>
            )
          })}
      </Flex>
    </Flex>
  )
})
