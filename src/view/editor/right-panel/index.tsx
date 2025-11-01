import { StageViewport } from 'src/editor/stage/viewport'
import { OperatePanelComp } from './operate'

export const RightPanelComp: FC<{}> = ({}) => {
  return (
    <G
      style={{
        width: StageViewport.bound.right,
        borderLeft: '1px solid var(--gray-border)',
      }}>
      <OperatePanelComp />
    </G>
  )
}
