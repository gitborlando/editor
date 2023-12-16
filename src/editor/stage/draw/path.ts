import { inject, injectable } from 'tsyringe'
import { min, rotatePoint } from '~/editor/math/base'
import { Path } from '~/editor/math/path/path'
import { PathPoint } from '~/editor/math/path/point'
import { xy_new, xy_plus_mutate, xy_rotate } from '~/editor/math/xy'
import { OperateGeometryService, injectOperateGeometry } from '~/editor/operate/geometry'
import { OperateService, injectOperate } from '~/editor/operate/operate'
import { IVector } from '~/editor/schema/type'
import { autobind } from '~/shared/decorator'
import { macro_StringMatch } from '~/shared/macro'
import { XY } from '~/shared/structure/xy'
import { cullNegatives } from '~/shared/utils'
import { StageElementService, injectStageElement } from '../element'
import { PIXI } from '../pixi'

@autobind
@injectable()
export class StageDrawPathService {
  constructor(
    @injectOperate private Operate: OperateService,
    @injectOperateGeometry private OperateGeometry: OperateGeometryService,
    @injectStageElement private StageElement: StageElementService
  ) {}
  getCachedPath(id: string) {
    return this.StageElement.pathCache.get(id)
  }
  private createPath(node: IVector) {
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
  patchPath(node: IVector) {
    const { pathCache } = this.StageElement
    const { oneTickChange } = this.Operate
    const { isGeometryChanged, beforeOperate } = this.OperateGeometry

    let path: Path
    if (!isGeometryChanged) {
      path = pathCache.getSet(node.id, () => this.createPath(node))
      return path
    }

    path = pathCache.get(node.id)

    if (beforeOperate.args[0][0] === 'x') {
      const x = oneTickChange['x']!
      path.forEachPoint(({ cur }) => (cur.x += x.new - x.old))
      return path
    }
    if (beforeOperate.args[0][0] === 'y') {
      const y = oneTickChange['y']!
      path.forEachPoint(({ cur }) => (cur.y += y.new - y.old))
      return path
    }
    if (macro_StringMatch`width|height|rotation`(beforeOperate.args[0][0])) {
      path.forEachPoint(({ cur, index }) => {
        const rotatedXY = xy_rotate(node.points[index], xy_new(0, 0), node.rotation)
        cur.x = rotatedXY.x + node.centerX
        cur.y = rotatedXY.y + node.centerY
      })
      return path
    }

    return pathCache.set(node.id, this.createPath(node))
  }
  drawPath(path: Path, element: PIXI.Graphics) {
    const hasArcedPointMap = new Set<PathPoint>()

    path.forEachLine(({ cur: curLine, at }) => {
      const startPoint = curLine.start
      const endPoint = curLine.end

      if (at.first) {
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
        if (at.end && !startPoint.jumpToRight) element.closePath()
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

export const injectStageDrawPath = inject(StageDrawPathService)
