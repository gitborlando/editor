import { Container, Graphics } from '@pixi/react'
import { FC, useRef } from 'react'
import { IGeometry, OperateGeometry } from '~/editor/operate/geometry'
import { OperateNode } from '~/editor/operate/node'
import { StageCursor } from '~/editor/stage/cursor'
import { StageDraw2 } from '~/editor/stage/draw/draw'
import { PIXI, Pixi } from '~/editor/stage/pixi'
import { StageViewport } from '~/editor/stage/viewport'
import { StageWidgetTransform } from '~/editor/stage/widget/transform'
import { Drag } from '~/global/event/drag'
import { useHookSignal } from '~/shared/signal/signal-react'
import { hslBlueColor } from '~/shared/utils/color'
import { IXY, iife, useSubComponent } from '~/shared/utils/normal'
import { createMultiLineHitArea } from '~/shared/utils/pixi/line-hit-area'

type ITransformComp = {}

export const TransformComp: FC<ITransformComp> = ({}) => {
  const zoom = StageViewport.zoom.value
  const { needDraw, calcTransformOBB } = StageWidgetTransform
  const vertexes = calcTransformOBB().calcVertexXY()
  useHookSignal(needDraw)

  if (OperateNode.selectIds.value.size === 0) {
    needDraw.value = false
  }

  const OutlinesComp = useSubComponent([zoom], ({}) => {
    return OperateNode.selectNodes.map((node) => (
      <Graphics
        key={node.id}
        draw={(g) => {
          if (node.type === 'vector') {
            g.clear()
            if (!needDraw.value) return
            g.lineStyle(0.5 / zoom, hslBlueColor(65))
            StageDraw2.drawShape(g, node)
          }
        }}
      />
    ))
  })

  const LineComp = useSubComponent<{
    p1: IXY
    p2: IXY
    type: 'top' | 'right' | 'bottom' | 'left'
  }>([zoom], ({ p1, p2, type }) => {
    const spread = 5
    const ref = useRef<PIXI.Graphics>(null)

    const mouseenter = () => {
      switch (type) {
        case 'top':
        case 'bottom':
          return StageCursor.type.dispatch('v-resize')
        case 'right':
        case 'left':
          return StageCursor.type.dispatch('h-resize')
      }
    }

    const mousedown = () => {
      Pixi.isForbidEvent = true
      StageWidgetTransform.mouseOnEdge = true
      const { x, y, width, height } = OperateGeometry.geometry
      Drag.onStart(() => {
        const operateKeys = iife(() => {
          if (type === 'top') return ['y', 'height']
          if (type === 'right') return ['width']
          if (type === 'bottom') return ['height']
          if (type === 'left') return ['x', 'width']
        })
        OperateGeometry.beforeOperate.dispatch(operateKeys as (keyof IGeometry)[])
      })
        .onMove(({ shift }) => {
          switch (type) {
            case 'top':
              OperateGeometry.setGeometry('y', y + shift.y)
              return OperateGeometry.setGeometry('height', height - shift.y)
            case 'right':
              return OperateGeometry.setGeometry('width', width + shift.x)
            case 'bottom':
              return OperateGeometry.setGeometry('height', height + shift.y)
            case 'left':
              OperateGeometry.setGeometry('x', x + shift.x)
              return OperateGeometry.setGeometry('width', width - shift.x)
          }
        })
        .onDestroy(() => {
          Pixi.isForbidEvent = false
          StageWidgetTransform.mouseOnEdge = false
          OperateGeometry.afterOperate.dispatch()
        })
    }

    return (
      <Graphics
        ref={ref}
        eventMode='static'
        onmouseenter={mouseenter}
        onmouseleave={() => StageCursor.type.dispatch('auto')}
        onmousedown={mousedown}
        draw={(g) => {
          g.clear()
          if (!needDraw.value) return
          g.lineStyle(1 / zoom, hslBlueColor(65))
          g.moveTo(p1.x, p1.y)
          g.lineTo(p2.x, p2.y)
          g.hitArea = createMultiLineHitArea([p1, p2], spread / zoom)
        }}
      />
    )
  })

  const VertexComp = useSubComponent<{
    xy: IXY
    type: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
  }>([zoom], ({ xy, type }) => {
    const spread = 8 / zoom

    const mouseenter = () => {
      switch (type) {
        case 'topLeft':
        case 'bottomRight':
          return StageCursor.type.dispatch('se-resize')
        case 'topRight':
        case 'bottomLeft':
          return StageCursor.type.dispatch('sw-resize')
      }
    }

    const mousedown = () => {
      Pixi.isForbidEvent = true
      StageWidgetTransform.mouseOnEdge = true
      const { x, y, width, height } = OperateGeometry.geometry
      Drag.onStart(() => {
        const operateKeys = iife(() => {
          if (type === 'topLeft') return ['x', 'y', 'width', 'height']
          if (type === 'topRight') return ['y', 'width', 'height']
          if (type === 'bottomRight') return ['width', 'height']
          if (type === 'bottomLeft') return ['x', 'width', 'height']
        })
        OperateGeometry.beforeOperate.dispatch(operateKeys as (keyof IGeometry)[])
      })
        .onMove(({ shift }) => {
          switch (type) {
            case 'topLeft':
              OperateGeometry.setGeometry('x', x + shift.x)
              OperateGeometry.setGeometry('y', y + shift.y)
              OperateGeometry.setGeometry('width', width - shift.x)
              return OperateGeometry.setGeometry('height', height - shift.y)
            case 'topRight':
              OperateGeometry.setGeometry('y', y + shift.y)
              OperateGeometry.setGeometry('width', width + shift.x)
              return OperateGeometry.setGeometry('height', height - shift.y)
            case 'bottomRight':
              OperateGeometry.setGeometry('width', width + shift.x)
              return OperateGeometry.setGeometry('height', height + shift.y)
            case 'bottomLeft':
              OperateGeometry.setGeometry('x', x + shift.x)
              OperateGeometry.setGeometry('width', width - shift.x)
              return OperateGeometry.setGeometry('height', height + shift.y)
          }
        })
        .onDestroy(() => {
          Pixi.isForbidEvent = false
          StageWidgetTransform.mouseOnEdge = false
          OperateGeometry.afterOperate.dispatch()
        })
    }

    return (
      <Graphics
        eventMode='static'
        onmouseenter={mouseenter}
        onmouseleave={() => StageCursor.type.dispatch('auto')}
        onmousedown={mousedown}
        draw={(g) => {
          g.clear()
          if (!needDraw.value) return
          const size = 6 / zoom
          g.lineStyle(1 / zoom, hslBlueColor(65))
          g.beginFill('white')
          g.drawRoundedRect(xy.x - size / 2, xy.y - size / 2, size, size, 1 / zoom)
          g.hitArea = {
            contains: (x, y) =>
              new PIXI.Rectangle(
                xy.x - size / 2 - spread,
                xy.y - size / 2 - spread,
                size + spread,
                size + spread
              ).contains(x, y),
          }
        }}
      />
    )
  })

  return (
    <Container>
      <OutlinesComp />
      <LineComp type='top' p1={vertexes[0]} p2={vertexes[1]} />
      <LineComp type='right' p1={vertexes[1]} p2={vertexes[2]} />
      <LineComp type='bottom' p1={vertexes[2]} p2={vertexes[3]} />
      <LineComp type='left' p1={vertexes[3]} p2={vertexes[0]} />
      <VertexComp type='topLeft' xy={vertexes[0]} />
      <VertexComp type='topRight' xy={vertexes[1]} />
      <VertexComp type='bottomRight' xy={vertexes[2]} />
      <VertexComp type='bottomLeft' xy={vertexes[3]} />
    </Container>
  )
}

TransformComp.displayName = 'TransformComp'