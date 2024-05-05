import { degreefy, sqrt } from '~/editor/math/base'
import { xy_new, xy_plus, xy_rotate } from '~/editor/math/xy'
import { PIXI } from '~/editor/stage/pixi'
import { IXY } from '../normal'

export function createMultiLineHitArea(points: IXY[], spread: number) {
  return {
    contains: (x: number, y: number) => {
      for (let i = 0; i < points.length; i += 2) {
        const polygon = createPolygonFromTwoPoints(points[i], points[i + 1], spread)
        if (polygon.contains(x, y)) return true
      }
      return false
    },
  }
}

function createPolygonFromTwoPoints(p1: IXY, p2: IXY, spread: number) {
  const [dx, dy] = [p2.x - p1.x, p2.y - p1.y]
  const length = sqrt(dx * dx + dy * dy)
  const angle = degreefy(Math.atan2(dy, dx))
  const transform = xy_new(p1.x + dx / 2, p1.y + dy / 2)

  let TL = xy_new(-length / 2, spread)
  let TR = xy_new(length / 2, spread)
  let BR = xy_new(length / 2, -spread)
  let BL = xy_new(-length / 2, -spread)

  TL = xy_rotate(TL, xy_new(0, 0), angle)
  TR = xy_rotate(TR, xy_new(0, 0), angle)
  BR = xy_rotate(BR, xy_new(0, 0), angle)
  BL = xy_rotate(BL, xy_new(0, 0), angle)

  TL = xy_plus(TL, transform)
  TR = xy_plus(TR, transform)
  BR = xy_plus(BR, transform)
  BL = xy_plus(BL, transform)

  return new PIXI.Polygon(TL, TR, BR, BL)
}
