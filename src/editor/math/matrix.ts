import { max, min } from 'src/editor/math/base'
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
  m6: number,
): IMatrix {
  return [m1, m2, m3, m4, m5, m6]
}

export function mx_invert(matrix: IMatrix): IMatrix {
  const [a, b, c, d, e, f] = matrix
  const invDet = 1 / (a * d - b * c)
  return [d, -b, -c, a, c * f - d * e, b * e - a * f].map(
    (i) => i * invDet,
  ) as IMatrix
}

export function mx_applyPoint(xy: IXY, matrix: IMatrix) {
  const { x, y } = xy
  const [a, b, c, d, e, f] = matrix
  return xy_(a * x + c * y + e, b * x + d * y + f)
}

export function mx_invertPoint(xy: IXY, matrix: IMatrix) {
  return mx_applyPoint(xy, mx_invert(matrix))
}

export function mx_applyAABB(aabb: AABB, matrix: IMatrix) {
  const { minX, minY, maxX, maxY } = aabb
  const xy1 = mx_applyPoint(xy_(minX, minY), matrix)
  const xy2 = mx_applyPoint(xy_(maxX, minY), matrix)
  const xy3 = mx_applyPoint(xy_(maxX, maxY), matrix)
  const xy4 = mx_applyPoint(xy_(minX, maxY), matrix)

  return {
    minX: min(xy1.x, xy2.x, xy3.x, xy4.x),
    minY: min(xy1.y, xy2.y, xy3.y, xy4.y),
    maxX: max(xy1.x, xy2.x, xy3.x, xy4.x),
    maxY: max(xy1.y, xy2.y, xy3.y, xy4.y),
  }
}

export function mx_invertAABB(aabb: AABB, matrix: IMatrix) {
  return mx_applyAABB(aabb, mx_invert(matrix))
}
