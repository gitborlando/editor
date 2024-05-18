import { FC } from 'react'
import { StageViewport } from '~/editor/stage/viewport'
import { UIRightPanel } from '~/editor/ui-state/right-panel/right-panel'
import { useHookSignal } from '~/shared/signal/signal-react'
import { Flex } from '~/view/ui-utility/widget/flex'
import { OperatePanelComp } from './operate/operate-panel'

type IRightPanelComp = {}

export const RightPanelComp: FC<IRightPanelComp> = ({}) => {
  const { currentTab } = UIRightPanel
  useHookSignal(currentTab)
  return (
    <Flex style={{ width: StageViewport.bound.value.right }} className='lay-v h-100% ml-auto'>
      {currentTab.value === 'operate' && <OperatePanelComp />}
    </Flex>
  )
}
