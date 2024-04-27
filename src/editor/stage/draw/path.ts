import autobind from 'class-autobind-decorator'
import { min, rotatePoint } from '~/editor/math/base'
import { Path } from '~/editor/math/path/path'
import { PathPoint } from '~/editor/math/path/point'
import { xy_plus_mutate } from '~/editor/math/xy'
import { IIrregular } from '~/editor/schema/type'
import { cullNegatives } from '~/shared/utils/normal'
import { XY } from '~/shared/xy'
import { StageElement } from '../element'
import { PIXI } from '../pixi'

@autobind
export class StageDrawPathService {
  getCachedPath(id: string) {
    return StageElement.pathCache.get(id)
  }
  createPath(node: IIrregular) {
    const pathPoints = node.points.map((nodePoint, i) => {
      const centerXY = XY.Of(node.centerX, node.centerY)
      const rotatedXY = rotatePoint(nodePoint.x, nodePoint.y, 0, 0, node.rotation)
      xy_plus_mutate(rotatedXY, centerXY)
      const rotatedHandleLeft =
        nodePoint.handleLeft && XY.From(nodePoint.handleLeft).rotate(XY.Of(0, 0), node.rotation)
      const rotatedHandleRight =
        nodePoint.handleRight && XY.From(nodePoint.handleRight).rotate(XY.Of(0, 0), node.rotation)
      return new PathPoint({
        ...nodePoint,
        ...rotatedXY,
        ...(rotatedHandleLeft && { handleLeft: rotatedHandleLeft.plus(centerXY) }),
        ...(rotatedHandleRight && { handleRight: rotatedHandleRight.plus(centerXY) }),
      })
    })
    return new Path(pathPoints)
  }
  drawPath(path: Path, element: PIXI.Graphics) {
    const hasArcedPointMap = new Set<PathPoint>()

    path.lines.forEach((curLine, index) => {
      const startPoint = curLine.start
      const endPoint = curLine.end

      if (index === 0) {
        const startXY = new XY(0, 0)
        if (startPoint.canDrawArc) {
          startXY.set(startPoint.leftLine!.calcXYInSomeDistance(startPoint.arcLength!)!)
        } else {
          startXY.set(startPoint)
        }
        element.moveTo(startXY.x, startXY.y)
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
          element.arcTo(
            startPoint.x,
            startPoint.y,
            startPoint.right!.x,
            startPoint.right!.y,
            radius
          )
          hasArcedPointMap.add(startPoint)
        }
        if (!endPoint.canDrawArc) {
          return element.lineTo(endPoint.x, endPoint.y)
        }
        if (endPoint.canDrawArc && !hasArcedPointMap.has(endPoint)) {
          const leftMaxRadius =
            endPoint.left!.arcLength &&
            endPoint.calcRadiusByArcLength(endPoint.leftLine!.length - endPoint.left!.arcLength!)
          const rightMaxRadius =
            endPoint.right!.arcLength &&
            endPoint.calcRadiusByArcLength(endPoint.rightLine!.length - endPoint.right!.arcLength)
          const radius = min(...cullNegatives(endPoint.radius, rightMaxRadius, leftMaxRadius))
          element.arcTo(endPoint.x, endPoint.y, endPoint.right!.x, endPoint.right!.y, radius)
          hasArcedPointMap.add(endPoint)
        }

        if (index === path.lines.length - 1 && !startPoint.jumpToRight) element.closePath()
      }

      if (curLine.type === 'curve') {
        const { start, end } = curLine
        const handleRight = start.handleRight || start
        const handleLeft = end.handleLeft || end
        element.bezierCurveTo(
          handleRight.x,
          handleRight.y,
          handleLeft.x,
          handleLeft.y,
          end.x,
          end.y
        )
      }
    })
  }
}

export const StageDrawPath = new StageDrawPathService()
