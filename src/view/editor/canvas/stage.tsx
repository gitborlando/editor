import { FC, memo } from 'react'
import { Surface } from 'src/editor/stage/render/surface'
import { Flex } from 'src/view/ui-utility/widget/flex'

export const CanvasStageComp: FC<{}> = memo(({}) => {
  return (
    <Flex className='wh-fit bg-white' onContextMenu={(e) => e.preventDefault()}>
      <canvas className='bg-[#F7F8FA]' ref={Surface.setCanvas} />
    </Flex>
  )
})
