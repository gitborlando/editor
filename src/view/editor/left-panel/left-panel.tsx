import { FC, createElement, memo } from 'react'
import { StageViewport } from '~/editor/stage/viewport'
import { UILeftPanel } from '~/editor/ui-state/left-panel/left-panel'
import { useHookSignal } from '~/shared/signal/signal-react'
import { iife } from '~/shared/utils/normal'
import { Flex } from '~/view/ui-utility/widget/flex'
import { PopupPanelComp } from './popup'
import { SwitchBarComp } from './switch-bar'

type ILeftPanelComp = {}

export const LeftPanelComp: FC<ILeftPanelComp> = memo(({}) => {
  const { showLeftPanel, currentTabId, switchTabMap, popupTabIds, switchTabIds } = UILeftPanel
  useHookSignal(showLeftPanel)
  useHookSignal(currentTabId)
  useHookSignal(popupTabIds)

  return (
    <Flex style={{ width: StageViewport.bound.value.x }} className='lay-h shrink-0 h-100% grow-0'>
      <SwitchBarComp />
      <Flex vshow={showLeftPanel.value} className='lay-v wh-240-100% grow-0'>
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
