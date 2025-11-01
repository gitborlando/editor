import { NodeHeaderComp } from './header'
import { NodeListComp } from './list'

export const NodeComp: FC<{}> = observer(({}) => {
  return (
    <G vertical>
      <NodeHeaderComp />
      <NodeListComp />
    </G>
  )
})
