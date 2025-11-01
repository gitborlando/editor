import { CSSProperties } from 'react'
import { renderElem } from 'src/editor/stage/render/react/reconciler'
import { StageScene } from 'src/editor/stage/render/scene'
import { Surface } from 'src/editor/stage/render/surface'
import { EditorStageCursorsComp } from 'src/view/editor/stage/cursor'
import { FPSComp } from 'src/view/editor/stage/fps'
import { EditorStageMarqueeComp } from 'src/view/editor/stage/marquee'
import { EditorStageOutlineComp } from 'src/view/editor/stage/outline'
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
        <EditorStageOutlineComp />
        <EditorStageTransformComp />
        <EditorStageMarqueeComp />
        <EditorStageCursorsComp />
      </>,
      StageScene.widgetRoot,
    )
  }, [])

  return (
    <G onContextMenu={(e) => e.preventDefault()}>
      <canvas className={cls('canvas')} ref={Surface.setCanvas} />
      <RulerComp />
      <FPSComp />
      <CooperateObservingBorderComp />
    </G>
  )
})

export const CooperateObservingBorderComp: FC<{}> = observer(({}) => {
  const { observingClientId: observingUserId } = YClients
  if (!observingUserId) return null
  console.log('observingUserId: ', observingUserId)

  const client = YClients.getClientById(observingUserId)

  return (
    <G
      className={cls('cooperate-observing-border')}
      style={{ '--color': client.color } as CSSProperties}></G>
  )
})

const cls = classes(css`
  &-canvas {
    background-color: #f7f8fa;
  }
  &-cooperate-observing-border {
    position: absolute;
    top: 0;
    left: 0;
    border: 2px solid var(--color);
  }
`)
