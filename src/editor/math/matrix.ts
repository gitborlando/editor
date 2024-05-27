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

export function mx_add(mx1: IMatrix, m2: IMatrix): IMatrix {
  return [
    mx1[0] + m2[0],
    mx1[1] + m2[1],
    mx1[2] + m2[2],
    mx1[3] + m2[3],
    mx1[4] + m2[4],
    mx1[5] + m2[5],
  ]
}

export function mx_multiply(mx1: IMatrix, m2: IMatrix): IMatrix {
  const a1 = mx1[0]
  const b1 = mx1[1]
  const c1 = mx1[2]
  const d1 = mx1[3]
  const e1 = mx1[4]
  const f1 = mx1[5]
  const a2 = m2[0]
  const b2 = m2[1]
  const c2 = m2[2]
  const d2 = m2[3]
  const e2 = m2[4]
  const f2 = m2[5]
  return [
    a1 * a2 + b1 * c2,
    a1 * b2 + b1 * d2,
    c1 * a2 + d1 * c2,
    c1 * b2 + d1 * d2,
    e1 * a2 + f1 * c2,
    e1 * b2 + f1 * d2,
  ]
}

export function mx_applyToPoints(xy: IXY, matrix?: IMatrix) {
  if (!matrix) return xy

  const { x, y } = xy
  const [a, b, c, d, e, f] = matrix
  return xy_(a * x + c * y + e, b * x + d * y + f)
}
