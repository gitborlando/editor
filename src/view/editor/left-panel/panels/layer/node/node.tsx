import { FC, memo } from 'react'
import { Flex } from 'src/view/ui-utility/widget/flex'
import { NodeHeaderComp } from './header'
import { NodeListComp } from './list'

type INodeComp = {}

export const NodeComp: FC<INodeComp> = memo(({}) => {
  return (
    <Flex className='lay-v wh-100%-fit bg-white'>
      <NodeHeaderComp />
      <NodeListComp />
    </Flex>
  )
})
