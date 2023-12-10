import { cullNegatives } from '~/editor/helper/utils'
import { min } from '~/editor/math/base'
import { XY } from '~/editor/math/xy'
import { IVector } from '~/editor/schema/type'
import { PIXI } from '../../pixi'
import { StageCTXService } from '../ctx/ctx'
import { Path } from './path'
import { PathPoint } from './point'

export function drawPath(element: PIXI.Graphics, vector: IVector, StageCtx: StageCTXService) {
  const pathPoints = vector.points.map((nodePoint) => {
    const rotatedXY = XY.From(nodePoint).rotate(XY.Of(0, 0), vector.rotation)
    const rotatedHandleLeft =
      nodePoint.handleLeft && XY.From(nodePoint.handleLeft).rotate(XY.Of(0, 0), vector.rotation)
    const rotatedHandleRight =
      nodePoint.handleRight && XY.From(nodePoint.handleRight).rotate(XY.Of(0, 0), vector.rotation)
    const centerXY = XY.Of(vector.centerX, vector.centerY)
    return new PathPoint({
      ...nodePoint,
      ...rotatedXY.plus(centerXY),
      ...(rotatedHandleLeft && { handleLeft: rotatedHandleLeft.plus(centerXY) }),
      ...(rotatedHandleRight && { handleRight: rotatedHandleRight.plus(centerXY) }),
    })
  })
  const path = new Path(pathPoints)

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
      StageCtx.moveTo(startXY)
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
        StageCtx.arcTo(startPoint, startPoint.right!, radius)
        hasArcedPointMap.add(startPoint)
      }
      if (!endPoint.canDrawArc) {
        return StageCtx.lineTo(endPoint)
      }
      if (endPoint.canDrawArc && !hasArcedPointMap.has(endPoint)) {
        const leftMaxRadius =
          endPoint.left!.arcLength &&
          endPoint.calcRadiusByArcLength(endPoint.leftLine!.length - endPoint.left!.arcLength!)
        const rightMaxRadius =
          endPoint.right!.arcLength &&
          endPoint.calcRadiusByArcLength(endPoint.rightLine!.length - endPoint.right!.arcLength)
        const radius = min(...cullNegatives(endPoint.radius, rightMaxRadius, leftMaxRadius))
        StageCtx.arcTo(endPoint, endPoint.right!, radius)
        hasArcedPointMap.add(endPoint)
      }
      if (at.end && !startPoint.jumpToRight) StageCtx.closePath()
    }

    if (curLine.type === 'curve') {
      const { start, end } = curLine
      const handleRight = start.handleRight || start
      const handleLeft = end.handleLeft || end
      StageCtx.bezierTo(handleRight, handleLeft, end)
    }
  })
}
