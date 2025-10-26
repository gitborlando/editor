import { FC } from 'react'
import { renderElem } from 'src/editor/stage/render/react/reconciler'
import { StageScene } from 'src/editor/stage/render/scene'
import { Surface } from 'src/editor/stage/render/surface'
import { EditorStageCursorsComp } from 'src/view/editor/stage/cursor'
import { FPSComp } from 'src/view/editor/stage/fps'
import { EditorStageMarqueeComp } from 'src/view/editor/stage/marquee'
import { RulerComp } from 'src/view/editor/stage/ruler'
import { EditorStageTransformComp } from 'src/view/editor/stage/transform'
import { useUnmount } from 'src/view/hooks/common'

export const StageComp: FC<{}> = observer(({}) => {
  useUnmount(() => {
    Surface.inited$.value = false
  })

  useEffect(() => {
    return renderElem(
      <>
        <EditorStageTransformComp />
        <EditorStageMarqueeComp />
        <EditorStageCursorsComp />
      </>,
      StageScene.widgetRoot,
    )
  }, [])

  return (
    <G onContextMenu={(e) => e.preventDefault()}>
      <canvas className='bg-[#F7F8FA]' ref={Surface.setCanvas} />
      <RulerComp />
      <FPSComp />
    </G>
  )
})
