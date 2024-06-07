import { AABB } from 'src/editor/math/obb'
import { xy_ } from 'src/editor/math/xy'
import { IXY } from 'src/shared/utils/normal'

export type IMatrix = [number, number, number, number, number, number]

export function mx_create(
  m1: number,
  m2: number,
  m3: number,
  m4: number,
  m5: number,
  m6: number
): IMatrix {
  return [m1, m2, m3, m4, m5, m6]
}

export function mx_add(mx1: IMatrix, mx2: IMatrix): IMatrix {
  const [a1, b1, c1, d1, e1, f1] = mx1
  const [a2, b2, c2, d2, e2, f2] = mx2

  return [a1 + a2, b1 + b2, c1 + c2, d1 + d2, e1 + e2, f1 + f2]
}

export function mx_multiply(mx1: IMatrix, mx2: IMatrix): IMatrix {
  const [a1, b1, c1, d1, e1, f1] = mx1
  const [a2, b2, c2, d2, e2, f2] = mx2

  const m1 = a1 * a2 + b1 * c2
  const m2 = a1 * b2 + b1 * d2
  const m3 = c1 * a2 + d1 * c2
  const m4 = c1 * b2 + d1 * d2
  const m5 = e1 * a2 + f1 * c2 + e2
  const m6 = e1 * b2 + f1 * d2 + f2

  return [m1, m2, m3, m4, m5, m6]
}

export function mx_applyToPoint(xy: IXY, matrix?: IMatrix) {
  if (!matrix) return xy

  const { x, y } = xy
  const [a, b, c, d, e, f] = matrix
  return xy_(a * x + c * y + e, b * x + d * y + f)
}

export function mx_invertToPoint(xy: IXY, matrix: IMatrix) {
  if (!matrix) return xy

  const { x, y } = xy
  const [a, b, c, d, e, f] = matrix
  return xy_((x - e) / a, (y - f) / d)
}

export function mx_applyToAABB(aabb: AABB, matrix?: IMatrix) {
  if (!matrix) return aabb

  const { minX, minY, maxX, maxY } = aabb
  const [a, b, c, d, e, f] = matrix
  const x1 = a * minX + c * minY + e
  const y1 = b * minX + d * minY + f
  const x2 = a * maxX + c * minY + e
  const y2 = b * maxX + d * minY + f
  const x3 = a * maxX + c * maxY + e
  const y3 = b * maxX + d * maxY + f
  const x4 = a * minX + c * maxY + e
  const y4 = b * minX + d * maxY + f

  return {
    minX: Math.min(x1, x2, x3, x4),
    minY: Math.min(y1, y2, y3, y4),
    maxX: Math.max(x1, x2, x3, x4),
    maxY: Math.max(y1, y2, y3, y4),
  }
}
