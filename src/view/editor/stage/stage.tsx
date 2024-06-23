import { FC, memo } from 'react'
import { Surface } from 'src/editor/stage/render/surface'
import { FPSComp } from 'src/view/editor/stage/fps'
import { RulerComp } from 'src/view/editor/stage/ruler'
import { Flex } from 'src/view/ui-utility/widget/flex'

export const StageComp: FC<{}> = memo(({}) => {
  return (
    <Flex className='wh-fit bg-white relative' onContextMenu={(e) => e.preventDefault()}>
      <canvas className='bg-[#F7F8FA]' ref={Surface.setCanvas} />
      <RulerComp />
      <FPSComp />
    </Flex>
  )
})
