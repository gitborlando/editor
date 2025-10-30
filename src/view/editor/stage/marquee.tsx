import { SchemaCreator } from 'src/editor/schema/creator'
import { StageSelect } from 'src/editor/stage/interact/select'
import { ElemReact } from 'src/editor/stage/render/elem'
import { getZoom } from 'src/editor/stage/viewport'
import { themeColor } from 'src/global/color'
import { rgbToRgba } from 'src/utils/color'

export const EditorStageMarqueeComp: FC<{}> = observer(({}) => {
  const { marquee } = StageSelect

  if (marquee.width <= 0 || marquee.height <= 0) {
    return null
  }

  const rect = SchemaCreator.rect({
    id: 'marquee',
    ...marquee,
    strokes: [SchemaCreator.solidStroke(themeColor(), 1 / getZoom())],
    fills: [SchemaCreator.fillColor(rgbToRgba(themeColor(55), 0.05))],
  })

  return <ElemReact node={rect} />
})
