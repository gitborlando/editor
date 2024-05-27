import { xy_divide, xy_minus } from 'src/editor/math/xy'
import { PIXI } from 'src/editor/stage/pixi'
import { StageViewport } from 'src/editor/stage/viewport'
import { polylineCollide, twoPointsSpreadRect } from '../collision'
import { IXY } from '../normal'

export function createMultiLineHitArea(points: IXY[], spread: number) {
  return {
    contains: (x: number, y: number) => {
      for (let i = 0; i < points.length - 1; i += 2) {
        const polygon = new PIXI.Polygon(twoPointsSpreadRect(points[i], points[i + 1], spread))
        if (polygon.contains(x, y)) return true
      }
      return false
    },
  }
}

export function pixiPolylineContainsPoint(points: IXY[]) {
  return (xy: IXY) => {
    const { zoom, stageOffset } = StageViewport
    const spread = 10 / zoom.value
    xy = xy_divide(xy_minus(xy, stageOffset.value), zoom.value)
    return polylineCollide(points, xy, spread)
  }
}
