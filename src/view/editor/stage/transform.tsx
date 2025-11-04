import { Angle, IXY, XY, xy_xAxis, xy_yAxis } from '@gitborlando/geo'
import { isLeftMouse, isRightMouse } from '@gitborlando/utils/browser'
import { OperateGeometry } from 'src/editor/operate/geometry'
import { SchemaCreator } from 'src/editor/schema/creator'
import { StageCursor } from 'src/editor/stage/cursor'
import { StageInteract } from 'src/editor/stage/interact/interact'
import { ElemMouseEvent, ElemReact } from 'src/editor/stage/render/elem'
import { Surface } from 'src/editor/stage/render/surface'
import { getZoom, StageViewport } from 'src/editor/stage/viewport'
import { COLOR, themeColor } from 'src/global/color'
import { Drag } from 'src/global/event/drag'
import { useSelectNodes } from 'src/view/hooks/schema/use-y-state'

let transformOBB = OBB.identityOBB()

const createStroke = () =>
  SchemaCreator.stroke({
    fill: SchemaCreator.fillColor(themeColor()),
    width: 1 / getZoom(),
  })

export const moveTransformer = (e: ElemMouseEvent) => {
  Drag.onStart(() => {
    if (e?.hostEvent.altKey) {
      StageCursor.setCursor('copy')
      // OperateNode.copySelectNodes()
      // OperateNode.pasteNodes()
    }
  })
    .onMove(({ delta }) => {
      delta = StageViewport.toSceneShift(delta)
      OperateGeometry.setActiveGeometry('x', delta.x)
      OperateGeometry.setActiveGeometry('y', delta.y)
    })
    .onDestroy(({ moved }) => {
      if (!moved) return

      if (e?.hostEvent.altKey) {
        // StageCursor.setCursor('select')
        // OperateGeometry.operateKeys.clear()
        // Schema.finalOperation('alt 复制节点')
      }
      YUndo.track({ type: 'state', description: '移动节点' })
    })
}

export const EditorStageTransformComp: FC<{}> = observer(({}) => {
  const selectNodes = useSelectNodes()

  transformOBB = useMemo(() => {
    if (selectNodes.length === 0) return OBB.identityOBB()
    if (selectNodes.length === 1)
      return OBB.fromRect(selectNodes[0], selectNodes[0].rotation)
    return OBB.fromAABB(
      AABB.merge(
        ...selectNodes.map((node) => OBB.fromRect(node, node.rotation).aabb),
      ),
    )
  }, [selectNodes])

  const node = SchemaCreator.rect({
    id: 'transform',
    ...transformOBB,
    fills: [],
  })

  const mousedown = (e: ElemMouseEvent) => {
    if (StageInteract.interaction !== 'select') return
    Surface.disablePointEvent(true)

    if (isLeftMouse(e.hostEvent)) {
      e.stopPropagation()
      moveTransformer(e)
    } else {
      // StageSelect.onMenu()
    }
  }

  const [p0, p1, p2, p3] = transformOBB.vertexes

  return (
    <ElemReact x-if={selectNodes.length > 0} node={node} events={{ mousedown }}>
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

const LineComp: FC<{ type: 'top' | 'bottom' | 'left' | 'right'; p1: IXY; p2: IXY }> =
  observer(({ type, p1, p2 }) => {
    const { setActiveGeometry } = OperateGeometry
    const selectedNodes = useSelectNodes()
    const line = SchemaCreator.line({
      id: `transform-line-${type}`,
      points: [
        SchemaCreator.point({ x: p1.x, y: p1.y }),
        SchemaCreator.point({ x: p2.x, y: p2.y }),
      ],
      strokes: [createStroke()],
    })

    const mouseover = (e: ElemMouseEvent) => {
      if (!e.hovered) return StageCursor.setCursor('select')

      if (selectedNodes.length === 1 && selectedNodes[0].type === 'line') {
        return StageCursor.setCursor('select')
      }

      switch (type) {
        case 'top':
        case 'bottom':
          return StageCursor.setCursor('resize', transformOBB.rotation + 90)
        case 'right':
        case 'left':
          return StageCursor.setCursor('resize', transformOBB.rotation)
      }
    }

    const mousedown = (e: ElemMouseEvent) => {
      StageCursor.lock()
      e.stopPropagation()

      const { rotation } = OperateGeometry.activeGeometry

      Drag.onStart()
        .onMove(({ delta }) => {
          delta = StageViewport.toSceneShift(delta)
          const deltaX = XY.from(delta).getDot(xy_xAxis(rotation))
          const deltaY = XY.from(delta).getDot(xy_yAxis(rotation))

          if (selectedNodes.length === 1 && selectedNodes[0].type === 'line') {
            setActiveGeometry('x', XY.from(delta).getDot(xy_xAxis(0)))
            setActiveGeometry('y', XY.from(delta).getDot(xy_yAxis(0)))
            return
          }

          if (e.hostEvent.shiftKey) {
            switch (type) {
              case 'top':
                setActiveGeometry('x', -(deltaY / 2) * Angle.sin(rotation))
                setActiveGeometry('y', (deltaY / 2) * Angle.cos(rotation))
                setActiveGeometry('height', -deltaY)
                setActiveGeometry('height', -deltaY)
                break
              case 'right':
                setActiveGeometry('width', deltaX)
                setActiveGeometry('x', (-deltaX / 2) * Angle.cos(rotation))
                setActiveGeometry('y', (-deltaX / 2) * Angle.sin(rotation))
                setActiveGeometry('width', -deltaX)
                break
              case 'bottom':
                setActiveGeometry('height', +deltaY)
                setActiveGeometry('x', (-deltaY / 2) * Angle.sin(rotation))
                setActiveGeometry('y', (-deltaY / 2) * Angle.cos(rotation))
                setActiveGeometry('height', -(-deltaY))
                break
              case 'left':
                setActiveGeometry('x', (deltaX / 2) * Angle.cos(rotation))
                setActiveGeometry('y', (deltaX / 2) * Angle.sin(rotation))
                setActiveGeometry('width', deltaX)
                setActiveGeometry('width', -deltaX)
                break
            }
          } else {
            switch (type) {
              case 'top':
                setActiveGeometry('x', -deltaY * Angle.sin(rotation))
                setActiveGeometry('y', deltaY * Angle.cos(rotation))
                setActiveGeometry('height', -deltaY)
                break
              case 'right':
                setActiveGeometry('width', deltaX)
                break
              case 'bottom':
                setActiveGeometry('height', deltaY)
                break
              case 'left':
                setActiveGeometry('x', deltaX * Angle.cos(rotation))
                setActiveGeometry('y', deltaX * Angle.sin(rotation))
                setActiveGeometry('width', -deltaX)
                break
            }
          }
        })
        .onDestroy(({ moved }) => {
          if (!moved) return
          YUndo.track({ type: 'state', description: '缩放选中形状' })
        })
    }

    return <ElemReact node={line} events={{ hover: mouseover, mousedown }} />
  })

const VertexComp: FC<{
  type: 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft'
  xy: IXY
}> = observer(({ type, xy }) => {
  const { setActiveGeometry } = OperateGeometry
  const size = 8 / getZoom()
  const obb = OBB.fromCenter(xy, size, size, transformOBB.rotation)
  const selectedNodes = useSelectNodes()

  const rect = SchemaCreator.rect({
    id: `transform-vertex-${type}`,
    ...obb,
    strokes: [createStroke()],
    fills: [SchemaCreator.fillColor(COLOR.white)],
    radius: 2 / getZoom(),
  })

  const mouseenter = (e: ElemMouseEvent) => {
    if (!e.hovered) return StageCursor.setCursor('select')

    if (selectedNodes.length === 1 && selectedNodes[0].type === 'line') {
      return StageCursor.setCursor('resize', transformOBB.rotation)
    }

    switch (type) {
      case 'topLeft':
      case 'bottomRight':
        return StageCursor.setCursor('resize', transformOBB.rotation + 45)
      case 'topRight':
      case 'bottomLeft':
        return StageCursor.setCursor('resize', transformOBB.rotation - 45)
    }
  }

  const moveVertex = (e: ElemMouseEvent) => {
    StageCursor.lock()
    const { rotation } = OperateGeometry.activeGeometry

    Drag.onStart()
      .onMove(({ delta }) => {
        delta = StageViewport.toSceneShift(delta)
        const deltaX = XY.from(delta).getDot(xy_xAxis(rotation))
        const deltaY = XY.from(delta).getDot(xy_yAxis(rotation))

        if (selectedNodes.length === 1 && selectedNodes[0].type === 'line') {
          setActiveGeometry('width', deltaX)
          setActiveGeometry('height', deltaY)
          return
        }

        if (e.hostEvent.shiftKey) {
          switch (type) {
            case 'topLeft':
              setActiveGeometry(
                'x',
                -deltaY * Angle.sin(rotation) + deltaX * Angle.cos(rotation),
              )
              setActiveGeometry(
                'y',
                deltaX * Angle.sin(rotation) + deltaY * Angle.cos(rotation),
              )
              setActiveGeometry('width', -deltaX)
              setActiveGeometry('height', -deltaY)
              break
            case 'topRight':
              setActiveGeometry('x', -deltaY * Angle.sin(rotation))
              setActiveGeometry('y', deltaY * Angle.cos(rotation))
              setActiveGeometry('height', -deltaY)
              setActiveGeometry('width', deltaX)
              break
            case 'bottomRight':
              setActiveGeometry('width', deltaX)
              setActiveGeometry('height', deltaY)
              setActiveGeometry(
                'x',
                (-deltaY / 2) * Angle.sin(rotation) +
                  (-deltaX / 2) * Angle.cos(rotation),
              )
              setActiveGeometry(
                'y',
                (-deltaX / 2) * Angle.sin(rotation) +
                  (-deltaY / 2) * Angle.cos(rotation),
              )
              setActiveGeometry('width', -deltaX)
              setActiveGeometry('height', -deltaY)
              break
            case 'bottomLeft':
              setActiveGeometry('x', deltaX * Angle.cos(rotation))
              setActiveGeometry(
                'y',
                deltaX * Angle.sin(rotation) + Angle.cos(rotation),
              )
              setActiveGeometry('width', -deltaX)
              setActiveGeometry('height', deltaY)
              break
          }
        } else {
          switch (type) {
            case 'topLeft':
              setActiveGeometry(
                'x',
                -deltaY * Angle.sin(rotation) + deltaX * Angle.cos(rotation),
              )
              setActiveGeometry(
                'y',
                deltaX * Angle.sin(rotation) + deltaY * Angle.cos(rotation),
              )
              setActiveGeometry('width', -deltaX)
              setActiveGeometry('height', -deltaY)
              break
            case 'topRight':
              setActiveGeometry('x', -deltaY * Angle.sin(rotation))
              setActiveGeometry('y', deltaY * Angle.cos(rotation))
              setActiveGeometry('height', -deltaY)
              setActiveGeometry('width', deltaX)
              break
            case 'bottomRight':
              setActiveGeometry('width', deltaX)
              setActiveGeometry('height', deltaY)
              break
            case 'bottomLeft':
              setActiveGeometry('x', deltaX * Angle.cos(rotation))
              setActiveGeometry('y', deltaX * Angle.sin(rotation))
              setActiveGeometry('width', -deltaX)
              setActiveGeometry('height', deltaY)
              break
          }
        }
      })
      .onDestroy(({ moved }) => {
        if (!moved) return
        YUndo.track({ type: 'state', description: '缩放选中形状' })
      })
  }

  const rotate = () => {
    StageCursor.setCursor('rotate').lock().upReset()

    const { center } = transformOBB
    let last: IXY
    Drag.onStart()
      .onMove(({ current, start }) => {
        if (!last) last = StageViewport.toSceneXY(start)
        current = StageViewport.toSceneXY(current)
        const deltaRotation = XY.from(current).getAngle(last, center)
        last = current

        setActiveGeometry('rotation', deltaRotation)
      })
      .onDestroy(({ moved }) => {
        if (!moved) return
        YUndo.track({ type: 'state', description: '旋转选中形状' })
      })
  }

  const mousedown = (e: ElemMouseEvent) => {
    e.stopPropagation()
    if (isLeftMouse(e.hostEvent)) return moveVertex(e)
    if (isRightMouse(e.hostEvent)) rotate()
  }

  return (
    <ElemReact
      node={rect}
      events={{
        hover: mouseenter,
        mousemove: (e) => e.stopPropagation(),
        mousedown,
      }}
    />
  )
})
