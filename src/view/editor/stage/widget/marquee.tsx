import { Graphics } from '@pixi/react'
import { FC, memo, useTransition } from 'react'
import { xy_ } from 'src/editor/math/xy'
import { StageSelect } from 'src/editor/stage/interact/select'
import { StageViewport } from 'src/editor/stage/viewport'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { hslBlueColor } from 'src/shared/utils/color'

type IMarqueeComp = {}

export const MarqueeComp: FC<IMarqueeComp> = memo(({}) => {
  const startTransition = useTransition()[1]
  useHookSignal(StageSelect.marquee, (_, update) => {
    startTransition(() => update())
  })

  return (
    <Graphics
      draw={(g) => {
        g.clear()
        if (!StageSelect.marquee.value) return
        const { x, y, width, height } = StageSelect.marquee.value
        const sceneStartXY = StageViewport.toSceneXY(xy_(x, y))
        const sceneShiftXY = StageViewport.toSceneShift(xy_(width, height))
        g.beginFill(hslBlueColor(65), 0.1)
        g.lineStyle(1 / StageViewport.zoom.value, hslBlueColor(65))
        g.drawRect(sceneStartXY.x, sceneStartXY.y, sceneShiftXY.x, sceneShiftXY.y)
      }}></Graphics>
  )
})

MarqueeComp.displayName = 'MarqueeComp'
