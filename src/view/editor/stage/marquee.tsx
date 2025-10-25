import { FC } from 'react'
import { SchemaCreate } from 'src/editor/schema/create'
import { StageSelect } from 'src/editor/stage/interact/select'
import { ElemReact } from 'src/editor/stage/render/elem'
import { getZoom } from 'src/editor/stage/viewport'
import { themeColor } from 'src/global/color'
import { rgbToRgba } from 'src/utils/color'

export const EditorStageMarqueeComp: FC<{}> = observer(({}) => {
  const { marquee } = StageSelect

  const rect = SchemaCreate.rect({
    id: 'marquee',
    ...marquee,
    strokes: [
      SchemaCreate.stroke({ fill: SchemaCreate.fillColor(themeColor()), width: 1 / getZoom() }),
    ],
    fills: [SchemaCreate.fillColor(rgbToRgba(themeColor(75), 0.1))],
  })

  return <ElemReact node={rect} />
})
