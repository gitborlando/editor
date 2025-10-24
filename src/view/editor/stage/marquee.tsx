import { FC } from 'react'
import { StageSelect } from 'src/editor/stage/interact/select'
import { ElemReact } from 'src/editor/stage/render/elem'
import { getZoom } from 'src/editor/stage/viewport'
import { mainColor } from 'src/global/color'
import { rgbToRgba } from 'src/utils/color'

export const EditorStageMarqueeComp: FC<{}> = observer(({}) => {
  const { marquee } = StageSelect
  return (
    <ElemReact
      id='marquee'
      obb={OBB.fromRect(marquee)}
      dirtyExpand={1}
      draw={(ctx) => {
        const { x, y, width, height } = marquee
        if (width === 0 && height === 0) return

        ctx.strokeStyle = mainColor()
        ctx.lineWidth = 1 / getZoom() / devicePixelRatio
        ctx.fillStyle = rgbToRgba(mainColor(), 0.1)
        ctx.fillRect(x, y, width, height)
        ctx.strokeRect(x, y, width, height)
      }}
    />
  )
})
