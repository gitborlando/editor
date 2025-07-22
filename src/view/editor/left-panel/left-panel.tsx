import { Flex } from '@gitborlando/widget'
import { FC, createElement, memo } from 'react'
import { StageViewport } from 'src/editor/stage/viewport'
import { UILeftPanel } from 'src/editor/ui-state/left-panel/left-panel'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { iife } from 'src/shared/utils/normal'
import { PopupPanelComp } from './switch-bar/popup'
import { SwitchBarComp } from './switch-bar/switch-bar'

type ILeftPanelComp = {}

export const LeftPanelComp: FC<ILeftPanelComp> = memo(({}) => {
  const { showLeftPanel, currentTabId, switchTabMap, popupTabIds, switchTabIds } = UILeftPanel
  useHookSignal(showLeftPanel)
  useHookSignal(currentTabId)
  useHookSignal(popupTabIds)

  return (
    <Flex
      layout='h'
      style={{ width: StageViewport.bound.value.x }}
      className='shrink-0 h-100% grow-0'>
      <SwitchBarComp />
      <Flex layout='v' vshow={showLeftPanel.value} className='wh-240-100% grow-0'>
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
