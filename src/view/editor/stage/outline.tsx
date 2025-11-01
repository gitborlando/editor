import { SchemaCreator } from 'src/editor/schema/creator'
import { SchemaHelper } from 'src/editor/schema/helper'
import { StageSelect } from 'src/editor/stage/interact/select'
import { ElemReact } from 'src/editor/stage/render/elem'
import { getZoom } from 'src/editor/stage/viewport'
import { getSelectIdMap, YClients } from 'src/editor/y-state/y-clients'
import { themeColor } from 'src/global/color'

type OutlineInfo = {
  hovered: boolean
  selected?: boolean
  color?: string
}

export const EditorStageOutlineComp: FC<{}> = observer(({}) => {
  const { hoverId } = StageSelect
  const otherSnap = t<V1.Clients>(useSnapshot(YClients.others))
  const { selectIds } = t<V1.Client>(useSnapshot(YClients.client))

  const outlineInfoLMap = useMemo(() => {
    const map: Record<string, OutlineInfo> = {}
    for (const { selectIds, color } of Object.values(otherSnap)) {
      for (const id of Object.keys(selectIds || {})) {
        map[id] = {
          hovered: hoverId === id,
          selected: getSelectIdMap()[id],
          color: color,
        }
      }
    }
    if (hoverId && !SchemaHelper.isFirstLayerFrame(hoverId)) {
      map[hoverId] = { hovered: true }
    }
    for (const [id, selected] of Object.entries(selectIds)) {
      map[id] = { hovered: hoverId === id, selected }
    }
    return map
  }, [otherSnap, hoverId, selectIds])

  return (
    <>
      {Object.entries(outlineInfoLMap).map(([id, outlineInfo]) => (
        <SingleOutlineComp key={id} id={id} outlineInfo={outlineInfo} />
      ))}
    </>
  )
})

const SingleOutlineComp: FC<{ id: string; outlineInfo: OutlineInfo }> = observer(
  ({ id, outlineInfo }) => {
    const { color, hovered, selected } = outlineInfo
    const snap = t<V1.Schema>(useSnapshot(YState.state))
    const node = t<V1.Node>(snap[id])
    const strokeColor = hovered || selected ? themeColor() : color
    const strokeWidth = selected ? 1 : 2
    const outline = SchemaCreator.clone<V1.Node>(node, {
      id: `${id}-outline`,
      fills: [],
    })

    if (node.type === 'text') {
      t<V1.Text>(outline).style.decoration = SchemaCreator.textDecoration({
        color: strokeColor!,
        width: strokeWidth / getZoom(),
      })
    } else if (strokeWidth) {
      t<V1.Node>(outline).strokes = [
        SchemaCreator.solidStroke(strokeColor, strokeWidth / getZoom()),
      ]
    }

    return <ElemReact node={outline} />
  },
)
