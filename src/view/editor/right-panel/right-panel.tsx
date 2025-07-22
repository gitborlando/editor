import { Flex } from '@gitborlando/widget'
import { FC } from 'react'
import { StageViewport } from 'src/editor/stage/viewport'
import { UIRightPanel } from 'src/editor/ui-state/right-panel/right-panel'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { OperatePanelComp } from './operate/operate-panel'

type IRightPanelComp = {}

export const RightPanelComp: FC<IRightPanelComp> = ({}) => {
  const { currentTab } = UIRightPanel
  useHookSignal(currentTab)

  return (
    <Flex
      style={{ width: StageViewport.bound.value.right }}
      layout='v'
      className='h-100% ml-auto shrink-0'>
      {currentTab.value === 'operate' && <OperatePanelComp />}
    </Flex>
  )
}
