import { xy_ } from '~/editor/math/xy'
import { BREAK, loopFor } from './array'
import { IRect, IXY } from './normal'

export function rectInAnotherRect(rectA: IRect, rectB: IRect) {
  if (rectA.x < rectB.x) return false
  if (rectA.y < rectB.y) return false
  if (rectA.x + rectA.width > rectB.x + rectB.width) return false
  if (rectA.y + rectA.height > rectB.y + rectB.height) return false
  return true
}

export function inPolygon(points: IXY[], xy: IXY) {
  let inside = false
  loopFor(points, (cur, next) => {
    if (cur.y > xy.y && next.y > xy.y) return
    if (cur.y < xy.y && next.y < xy.y) return
    const [small, large] = [cur, next].sort((a, b) => a.y - b.y)
    const A = xy_(large.x - small.x, large.y - small.y)
    const B = xy_(xy.x - small.x, xy.y - small.y)
    if (A.x * B.y - A.y * B.x > 0) inside = !inside
  })
  return inside
}

export function polylineCollide(points: IXY[], xy: IXY, spread: number) {
  let isCollide = false
  loopFor(points, (cur, next) => {
    const fourVertex = twoPointsSpreadRect(cur, next, spread)
    if (inPolygon(fourVertex, xy)) {
      isCollide = true
      return BREAK
    }
  })
  return isCollide
}

export function twoPointsSpreadRect(p1: IXY, p2: IXY, spread: number) {
  const [dx, dy] = [p2.x - p1.x, p2.y - p1.y]
  const radian = Math.atan2(dy, dx)
  const xShift = spread * Math.sin(radian)
  const yShift = spread * Math.cos(radian)
  const TL = xy_(p1.x - xShift, p1.y + yShift)
  const TR = xy_(p2.x - xShift, p2.y + yShift)
  const BR = xy_(p2.x + xShift, p2.y - yShift)
  const BL = xy_(p1.x + xShift, p1.y - yShift)
  return [TL, TR, BR, BL]
}
