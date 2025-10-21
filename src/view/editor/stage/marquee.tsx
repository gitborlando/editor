import { OBB } from '@gitborlando/geo'
import { FC } from 'react'
import { StageSelect } from 'src/editor/stage/interact/select'
import { ElemReact } from 'src/editor/stage/render/elem'
import { StageViewport } from 'src/editor/stage/viewport'
import { mainColor } from 'src/global/color'
import { rgbToRgba } from 'src/utils/color'

export const MarqueeComp: FC<{}> = observer(({}) => {
  const { marquee } = StageSelect
  const obb = OBB.fromRect(marquee)
  return (
    <ElemReact
      id='marquee'
      obb={obb}
      getDirtyRect={(expand) => expand(obb.aabb, 2)}
      draw={(ctx) => {
        const { x, y, width, height } = marquee
        if (width === 0 && height === 0) return

        ctx.strokeStyle = mainColor()
        console.log('mainColor(65): ', mainColor(65))
        ctx.lineWidth = 1 / StageViewport.zoom$.value / devicePixelRatio
        ctx.fillStyle = rgbToRgba(mainColor(), 0.1)
        ctx.fillRect(x, y, width, height)
        ctx.strokeRect(x, y, width, height)
      }}
    />
  )
})
