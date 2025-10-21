import { FC } from 'react'
import { renderElem } from 'src/editor/stage/render/react/reconciler'
import { StageScene } from 'src/editor/stage/render/scene'
import { Surface } from 'src/editor/stage/render/surface'
import { FPSComp } from 'src/view/editor/stage/fps'
import { MarqueeComp } from 'src/view/editor/stage/marquee'
import { RulerComp } from 'src/view/editor/stage/ruler'
import { useUnmount } from 'src/view/hooks/common'

export const StageComp: FC<{}> = observer(({}) => {
  useUnmount(() => {
    Surface.inited$.value = false
  })

  useEffect(() => {
    return renderElem(<MarqueeComp />, StageScene.widgetRoot)
  }, [])

  return (
    <G onContextMenu={(e) => e.preventDefault()}>
      <canvas className='bg-[#F7F8FA]' ref={Surface.setCanvas} />
      <RulerComp />
      <FPSComp />
    </G>
  )
})
