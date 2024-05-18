import { FC } from 'react'
import { Flex } from '~/view/ui-utility/widget/flex'
import { NodeHeaderComp } from './header'
import { NodeListComp } from './list'

type INodeComp = {}

export const NodeComp: FC<INodeComp> = ({}) => {
  return (
    <Flex className='lay-v wh-100%-fit bg-white'>
      <NodeHeaderComp />
      <NodeListComp />
    </Flex>
  )
}
