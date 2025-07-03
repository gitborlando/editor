import { FC, memo } from 'react'
import { Flex } from 'src/view/component/flex/flex'

export const CompTestComp: FC<{}> = memo(({}) => {
  return (
    <Flex layout='h' gap={4} vif={false} className='wh-400-300 bg-gray'>
      <Flex block='y' className='w-100 bg-red'></Flex>
      <Flex block='y' className='w-100 bg-blue'></Flex>
    </Flex>
  )
})
