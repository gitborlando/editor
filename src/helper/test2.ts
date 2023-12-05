import { min } from '~/editor/math/base'
import { XY } from '~/editor/math/xy'
import { Path } from '~/editor/stage/draw/path/path'
import { PathPoint } from '~/editor/stage/draw/path/point'
import { IXY, cullNegatives } from '~/editor/utility/utils'

export function testDraw2(_ctx: CanvasRenderingContext2D) {
  const ctx = new CTX(_ctx)

  const path = new Path([
    new PathPoint({ x: 0, y: 0, type: 'arc', radius: 10 }),
    new PathPoint({ x: 50, y: 0, type: 'arc', radius: 10, jumpToRight: false }),
    new PathPoint({ x: 100, y: 100, type: 'arc', radius: 10, jumpToRight: false }),
  ])

  ctx.ctx.translate(10, 10)
  ctx.ctx.beginPath()

  const hasArcedPointMap = new Set<PathPoint>()
  path.forEachLine(({ cur: curLine, at }) => {
    const { start: startPoint, end: endPoint } = curLine
    if (at.first) {
      const startXY = new XY(0, 0)
      if (startPoint.canDrawArc) {
        startXY.set(startPoint.leftLine!.calcXYInSomeDistance(startPoint.arcLength!)!)
      } else {
        startXY.set(startPoint)
      }
      ctx.moveTo(startXY)
    }

    if (curLine.type === 'line') {
      if (startPoint.canDrawArc && !hasArcedPointMap.has(startPoint)) {
        const leftMaxRadius =
          startPoint.left!.arcLength &&
          startPoint.calcRadiusByArcLength(
            startPoint.leftLine!.length - startPoint.left!.arcLength!
          )
        const rightMaxRadius =
          startPoint.right!.arcLength &&
          startPoint.calcRadiusByArcLength(
            startPoint.rightLine!.length - startPoint.right!.arcLength
          )
        const radius = min(...cullNegatives(startPoint.radius, rightMaxRadius, leftMaxRadius))
        ctx.arcTo(startPoint, startPoint.right!, radius)
        hasArcedPointMap.add(startPoint)
      }
      if (!endPoint.canDrawArc) {
        return ctx.lineTo(endPoint)
      }
      if (endPoint.canDrawArc && !hasArcedPointMap.has(endPoint)) {
        const leftMaxRadius =
          endPoint.left!.arcLength &&
          endPoint.calcRadiusByArcLength(endPoint.leftLine!.length - endPoint.left!.arcLength!)
        const rightMaxRadius =
          endPoint.right!.arcLength &&
          endPoint.calcRadiusByArcLength(endPoint.rightLine!.length - endPoint.right!.arcLength)
        const radius = min(...cullNegatives(endPoint.radius, rightMaxRadius, leftMaxRadius))
        ctx.arcTo(endPoint, endPoint.right!, radius)
        hasArcedPointMap.add(endPoint)
      }
      if (at.end && !startPoint.jumpToRight) ctx.ctx.closePath()
    }

    if (curLine.type === 'curve') {
    }
  })

  ctx.ctx.strokeStyle = 'rgba(255,0,0,1)'
  ctx.ctx.lineWidth = 1
  // ctx.ctx.fillStyle = 'gray'
  // ctx.ctx.fill()
  ctx.ctx.stroke()
}

class CTX {
  constructor(public ctx: CanvasRenderingContext2D) {}
  moveTo({ x, y }: IXY) {
    this.ctx.moveTo(x, y)
  }
  lineTo({ x, y }: IXY) {
    this.ctx.lineTo(x, y)
  }
  arcTo(p1: IXY, p2: IXY, radius: number) {
    this.ctx.arcTo(p1.x, p1.y, p2.x, p2.y, radius)
  }
}
