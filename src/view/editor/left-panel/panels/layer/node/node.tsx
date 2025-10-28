import { Flex } from '@gitborlando/widget'
import { FC, memo } from 'react'
import { NodeHeaderComp } from './header'
import { NodeListComp } from './list'

type INodeComp = {}

export const NodeComp: FC<INodeComp> = memo(({}) => {
  return (
    <Flex layout='v' className='wh-100%-fit bg-white'>
      <NodeHeaderComp />
      <NodeListComp />
    </Flex>
  )
})
