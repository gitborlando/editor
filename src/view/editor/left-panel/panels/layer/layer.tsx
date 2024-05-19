import { FC, memo } from 'react'
import { Flex } from '~/view/ui-utility/widget/flex'
import { NodeComp } from './node/node'
import { PageComp } from './page/page'

type ILayerComp = {}

export const LayerComp: FC<ILayerComp> = memo(({}) => {
  return (
    <Flex className='lay-v wh-100% bg-white'>
      <PageComp />
      <NodeComp />
    </Flex>
  )
})
