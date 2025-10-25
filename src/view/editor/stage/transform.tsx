import { IXY } from '@gitborlando/geo'
import { FC } from 'react'
import { SchemaCreate } from 'src/editor/schema/create'
import { ElemReact } from 'src/editor/stage/render/elem'
import { getZoom } from 'src/editor/stage/viewport'
import { COLOR, themeColor } from 'src/global/color'
import { useSelectNodes } from 'src/view/hooks/schema/use-y-state'

let transformOBB = OBB.identityOBB()

const createStroke = () =>
  SchemaCreate.stroke({ fill: SchemaCreate.fillColor(themeColor()), width: 1 / getZoom() })

export const EditorStageTransformComp: FC<{}> = observer(({}) => {
  const selectNodes = useSelectNodes()

  transformOBB = useMemo(() => {
    if (selectNodes.length === 0) return OBB.identityOBB()
    if (selectNodes.length === 1) return OBB.fromRect(selectNodes[0], selectNodes[0].rotation)
    return OBB.fromAABB(
      AABB.merge(...selectNodes.map((node) => OBB.fromRect(node, node.rotation).aabb)),
    )
  }, [selectNodes])

  const node = SchemaCreate.rect({ id: 'transform', fills: [] })

  const [p0, p1, p2, p3] = transformOBB.vertexes

  return (
    <ElemReact x-if={selectNodes.length > 0} node={node}>
      <LineComp type='top' p1={p0} p2={p1} />
      <LineComp type='bottom' p1={p2} p2={p3} />
      <LineComp type='left' p1={p0} p2={p3} />
      <LineComp type='right' p1={p1} p2={p2} />
      <VertexComp type='topLeft' xy={p0} />
      <VertexComp type='topRight' xy={p1} />
      <VertexComp type='bottomRight' xy={p2} />
      <VertexComp type='bottomLeft' xy={p3} />
    </ElemReact>
  )
})

const LineComp: FC<{ type: 'top' | 'bottom' | 'left' | 'right'; p1: IXY; p2: IXY }> = observer(
  ({ type, p1, p2 }) => {
    const line = SchemaCreate.line({
      id: `transform-line-${type}`,
      points: [SchemaCreate.point({ x: p1.x, y: p1.y }), SchemaCreate.point({ x: p2.x, y: p2.y })],
      strokes: [createStroke()],
    })

    return <ElemReact node={line} />
  },
)

const VertexComp: FC<{ type: 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft'; xy: IXY }> =
  observer(({ type, xy }) => {
    const size = 8 / getZoom()
    const obb = OBB.fromCenter(xy, size, size, transformOBB.rotation)

    const rect = SchemaCreate.rect({
      id: `transform-vertex-${type}`,
      ...obb,
      strokes: [createStroke()],
      fills: [SchemaCreate.fillColor(COLOR.white)],
      radius: 2 / getZoom(),
    })

    return <ElemReact node={rect} />
  })
