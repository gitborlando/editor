import { Flex } from '@gitborlando/widget'
import { FC, memo } from 'react'
import { NodeComp } from './node/node'
import { PageComp } from './page/page'

type ILayerComp = {}

export const LayerComp: FC<ILayerComp> = memo(({}) => {
  return (
    <Flex layout='v' className='wh-100% bg-white shrink-0'>
      <PageComp />
      <NodeComp />
    </Flex>
  )
})
