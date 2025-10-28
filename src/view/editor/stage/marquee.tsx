import { FC } from 'react'
import { SchemaCreator } from 'src/editor/schema/create'
import { StageSelect } from 'src/editor/stage/interact/select'
import { ElemReact } from 'src/editor/stage/render/elem'
import { getZoom } from 'src/editor/stage/viewport'
import { themeColor } from 'src/global/color'
import { rgbToRgba } from 'src/utils/color'

export const EditorStageMarqueeComp: FC<{}> = observer(({}) => {
  const { marquee } = StageSelect

  const rect = SchemaCreator.rect({
    id: 'marquee',
    ...marquee,
    strokes: [
      SchemaCreator.stroke({
        fill: SchemaCreator.fillColor(themeColor()),
        width: 1 / getZoom(),
      }),
    ],
    fills: [SchemaCreator.fillColor(rgbToRgba(themeColor(75), 0.1))],
  })

  return <ElemReact node={rect} />
})
