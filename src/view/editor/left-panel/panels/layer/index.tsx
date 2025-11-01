import { NodeComp } from './node'
import { PageComp } from './page'

export const LayerComp: FC<{}> = observer(({}) => {
  return (
    <G vertical center>
      <PageComp />
      <NodeComp />
    </G>
  )
})
