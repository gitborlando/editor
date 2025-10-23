import { FC } from 'react'
import { StageViewport } from 'src/editor/stage/viewport'
import { UIRightPanel } from 'src/editor/ui-state/right-panel/right-panel'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { OperatePanelComp } from './operate/operate-panel'

export const RightPanelComp: FC<{}> = ({}) => {
  const { currentTab } = UIRightPanel
  useHookSignal(currentTab)

  return (
    <G style={{ width: StageViewport.bound.right }} className='bd-1-#E3E3E3-l'>
      {currentTab.value === 'operate' && <OperatePanelComp />}
    </G>
  )
}
