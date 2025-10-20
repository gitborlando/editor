import { FC, memo } from 'react'
import { Surface } from 'src/editor/stage/render/surface'
import { FPSComp } from 'src/view/editor/stage/fps'
import { RulerComp } from 'src/view/editor/stage/ruler'
import { useUnmount } from 'src/view/hooks/common'

export const StageComp: FC<{}> = memo(({}) => {
  useUnmount(() => {
    Surface.inited$.value = false
  })

  return (
    <G onContextMenu={(e) => e.preventDefault()}>
      <canvas className='bg-[#F7F8FA]' ref={Surface.setCanvas} />
      <RulerComp />
      <FPSComp />
    </G>
  )
})
