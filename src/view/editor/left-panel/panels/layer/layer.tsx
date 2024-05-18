import { FC, memo } from 'react'
import { Schema } from '~/editor/schema/schema'
import { useHookSignal } from '~/shared/signal/signal-react'
import { Flex } from '~/view/ui-utility/widget/flex'
import { NodeComp } from './node/node'
import { PageComp } from './page/page'

type ILayerComp = {}

export const LayerComp: FC<ILayerComp> = memo(({}) => {
  useHookSignal(Schema.schemaChanged)

  return (
    <Flex className='lay-v wh-100% bg-white'>
      <PageComp />
      <NodeComp />
    </Flex>
  )
})
