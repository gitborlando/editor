import { IXY } from '@gitborlando/geo'
import { FC } from 'react'
import { radianfy } from 'src/editor/math/base'
import { ElemReact } from 'src/editor/stage/render/elem'
import { getZoom } from 'src/editor/stage/viewport'
import { mainColor } from 'src/global/color'
import { useSelectNodes } from 'src/view/hooks/schema/use-y-state'

let transformOBB = OBB.identityOBB()

export const EditorStageTransformComp: FC<{}> = observer(({}) => {
  const selectNodes = useSelectNodes()

  transformOBB = useMemo(() => {
    if (selectNodes.length === 0) return OBB.identityOBB()
    if (selectNodes.length === 1) return OBB.fromRect(selectNodes[0], selectNodes[0].rotation)
    return OBB.fromAABB(
      AABB.merge(...selectNodes.map((node) => OBB.fromRect(node, node.rotation).aabb)),
    )
  }, [selectNodes])

  const [p0, p1, p2, p3] = transformOBB.calcVertexXY()

  return (
    <ElemReact id='transform' obb={transformOBB}>
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

const LineComp: FC<{ type: 'top' | 'bottom' | 'left' | 'right'; p1: IXY; p2: IXY }> = ({
  type,
  p1,
  p2,
}) => {
  return (
    <ElemReact
      id={`transform-line-${type}`}
      draw={(ctx, path2d) => {
        ctx.lineWidth = 1 / getZoom()
        ctx.strokeStyle = mainColor()
        path2d.moveTo(p1.x, p1.y)
        path2d.lineTo(p2.x, p2.y)
        ctx.stroke(path2d)
      }}
    />
  )
}

const VertexComp: FC<{ type: 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft'; xy: IXY }> = ({
  type,
  xy,
}) => {
  const size = 6 / getZoom()
  const obb = OBB.fromCenter(xy, size, size, transformOBB.rotation)

  return (
    <ElemReact
      id={`transform-vertex-${type}`}
      obb={obb}
      draw={(ctx, path2d) => {
        path2d.roundRect(-size / 2, -size / 2, size, size, 1 / getZoom())
        ctx.lineWidth = 2 / getZoom()
        ctx.strokeStyle = mainColor()
        ctx.fillStyle = 'white'
        ctx.translate(xy.x, xy.y)
        ctx.rotate(radianfy(transformOBB.rotation))
        ctx.stroke(path2d)
        ctx.fill(path2d)
      }}
    />
  )
}
