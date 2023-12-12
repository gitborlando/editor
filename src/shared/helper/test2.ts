import { min } from '~/editor/math/base'
import { Path } from '~/editor/stage/draw/path/path'
import { PathPoint } from '~/editor/stage/draw/path/point'
import { XY } from '~/shared/structure/xy'
import { IXY, cullNegatives } from '~/shared/utils'

export function testDraw2(_ctx: CanvasRenderingContext2D) {
  const ctx = new CTX(_ctx)

  const path = new Path([
    new PathPoint({ x: 0, y: 0, bezierType: 'symmetric', radius: 0, handleRight: XY.Of(0, -50) }),
    new PathPoint({
      x: 100,
      y: 0,
      bezierType: 'symmetric',
      radius: 0,
      //handleLeft: XY.Of(100, -100),
    }),
    new PathPoint({ x: 100, y: 100, bezierType: 'no-bezier', radius: 0 }),
    new PathPoint({ x: 0, y: 100, bezierType: 'no-bezier', radius: 0 }),
  ])

  console.log(path)

  ctx.ctx.translate(100, 100)
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
      const { start, end } = curLine
      const handleRight = start.handleRight || start
      const handleLeft = end.handleLeft || end
      ctx.bezierTo(handleRight, handleLeft, end)
    }
  })

  ctx.ctx.strokeStyle = 'rgba(255,0,0,1)'
  ctx.ctx.lineWidth = 1
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
  bezierTo(c1: IXY, c2: IXY, to: IXY) {
    this.ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, to.x, to.y)
  }
}
