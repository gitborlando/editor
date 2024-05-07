import { Container, Graphics } from '@pixi/react'
import { FC } from 'react'
import { Schema } from '~/editor/schema/schema'
import { IClient } from '~/editor/schema/type'
import { StageDraw2 } from '~/editor/stage/draw/draw'
import { StageViewport } from '~/editor/stage/viewport'
import { useMemoSubComponent } from '~/shared/utils/normal'

type ICooperationComp = {}

export const CooperationComp: FC<ICooperationComp> = ({}) => {
  const zoom = StageViewport.zoom.value
  // const { needDraw, calcCooperationOBB } = StageWidgetCooperation
  // const vertexes = calcCooperationOBB().calcVertexXY()
  // useHookSignal(needDraw)

  const clients = Object.values(Schema.meta.clients).filter(({ id }) => Schema.client.id !== id)

  const OutlinesComp = useMemoSubComponent<{ client: IClient }>([zoom], ({ client }) => {
    const nodes = client.selectIds.map(Schema.find)
    return nodes.map((node) => (
      <Graphics
        key={node.id}
        draw={(g) => {
          if (node.type === 'vector') {
            g.clear()
            //  if (!needDraw.value) return
            g.lineStyle(1 / zoom, 'red')
            StageDraw2.drawShape(g, node)
          }
        }}
      />
    ))
  })

  // const LineComp = useSubComponent<{
  //   p1: IXY
  //   p2: IXY
  //   type: 'top' | 'right' | 'bottom' | 'left'
  // }>([zoom], ({ p1, p2, type }) => {
  //   const spread = 5
  //   const ref = useRef<PIXI.Graphics>(null)

  //   const mouseenter = () => {
  //     switch (type) {
  //       case 'top':
  //       case 'bottom':
  //         return StageCursor.type.dispatch('v-resize')
  //       case 'right':
  //       case 'left':
  //         return StageCursor.type.dispatch('h-resize')
  //     }
  //   }

  //   const mousedown = () => {
  //     Pixi.isForbidEvent = true
  //     StageWidgetCooperation.mouseOnEdge = true
  //     const { x, y, width, height } = OperateGeometry.geometry
  //     Drag.onStart(() => {
  //       const operateKeys = iife(() => {
  //         if (type === 'top') return ['y', 'height']
  //         if (type === 'right') return ['width']
  //         if (type === 'bottom') return ['height']
  //         if (type === 'left') return ['x', 'width']
  //       })
  //       OperateGeometry.beforeOperate.dispatch(operateKeys as (keyof IGeometry)[])
  //     })
  //       .onMove(({ shift }) => {
  //         switch (type) {
  //           case 'top':
  //             OperateGeometry.setGeometry('y', y + shift.y)
  //             return OperateGeometry.setGeometry('height', height - shift.y)
  //           case 'right':
  //             return OperateGeometry.setGeometry('width', width + shift.x)
  //           case 'bottom':
  //             return OperateGeometry.setGeometry('height', height + shift.y)
  //           case 'left':
  //             OperateGeometry.setGeometry('x', x + shift.x)
  //             return OperateGeometry.setGeometry('width', width - shift.x)
  //         }
  //       })
  //       .onDestroy(() => {
  //         Pixi.isForbidEvent = false
  //         StageWidgetCooperation.mouseOnEdge = false
  //         OperateGeometry.afterOperate.dispatch()
  //       })
  //   }

  //   return (
  //     <Graphics
  //       ref={ref}
  //       eventMode='static'
  //       onmouseenter={mouseenter}
  //       onmouseleave={() => StageCursor.type.dispatch('auto')}
  //       onmousedown={mousedown}
  //       draw={(g) => {
  //         g.clear()
  //         if (!needDraw.value) return
  //         g.lineStyle(1 / zoom, hslBlueColor(65))
  //         g.moveTo(p1.x, p1.y)
  //         g.lineTo(p2.x, p2.y)
  //         g.hitArea = createMultiLineHitArea([p1, p2], spread / zoom)
  //       }}
  //     />
  //   )
  // })

  //   return (
  //     <Graphics
  //       eventMode='static'
  //       onmouseenter={mouseenter}
  //       onmouseleave={() => StageCursor.type.dispatch('auto')}
  //       onmousedown={mousedown}
  //       draw={(g) => {
  //         g.clear()
  //         if (!needDraw.value) return
  //         const size = 6 / zoom
  //         g.lineStyle(1 / zoom, hslBlueColor(65))
  //         g.beginFill('white')
  //         g.drawRoundedRect(xy.x - size / 2, xy.y - size / 2, size, size, 1 / zoom)
  //         g.hitArea = {
  //           contains: (x, y) =>
  //             new PIXI.Rectangle(
  //               xy.x - size / 2 - spread,
  //               xy.y - size / 2 - spread,
  //               size + spread,
  //               size + spread
  //             ).contains(x, y),
  //         }
  //       }}
  //     />
  //   )
  // })

  return (
    <Container>
      {clients.map((client) => (
        <OutlinesComp client={client} />
      ))}
      {/* <LineComp type='top' p1={vertexes[0]} p2={vertexes[1]} />
      <LineComp type='right' p1={vertexes[1]} p2={vertexes[2]} />
      <LineComp type='bottom' p1={vertexes[2]} p2={vertexes[3]} />
      <LineComp type='left' p1={vertexes[3]} p2={vertexes[0]} />
      <VertexComp type='topLeft' xy={vertexes[0]} />
      <VertexComp type='topRight' xy={vertexes[1]} />
      <VertexComp type='bottomRight' xy={vertexes[2]} />
      <VertexComp type='bottomLeft' xy={vertexes[3]} /> */}
    </Container>
  )
}

CooperationComp.displayName = 'CooperationComp'
