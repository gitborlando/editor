import { XY } from '~/shared/helper/xy'
import { abs, pow2, pow3 } from './base'

/* 贝塞尔参数方程 */
export function bezierParametricEquation(
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  a1x: number, //这几个都是控制点
  a1y: number,
  a2x: number,
  a2y: number,
  t: number //参数t
) {
  const A = new XY(p1x, p1y)
  const B = new XY(p2x, p2y)
  const C = new XY(a1x, a1y)
  const D = new XY(a2x, a2y)
  const newXY = XY.Plus(
    A.multiply(pow3(1 - t)),
    C.multiply(3, t, pow2(1 - t)),
    D.multiply(3, pow2(t), 1 - t),
    B.multiply(pow3(t))
  )
  return newXY.toArray()
}

/* 求贝塞尔曲线的中点, 即到两个端点的距离相同 */
export function bezierMidpoint(
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  a1x: number,
  a1y: number,
  a2x: number,
  a2y: number
) {
  let arr: {
    t: number
    x: number
    y: number
    subLength: number
    shift: number
  }[] = []
  let lastX = new XY(p1x, p1y)
  let iteration = 30 //粒度, 越大拟合越精细
  let length = 0
  for (let i = 0; i <= iteration; i++) {
    let t = i / iteration
    let [x, y] = bezierParametricEquation(p1x, p1x, p2x, p2y, a1x, a1y, a2x, a2y, t)
    let subLength = new XY(x, y).distance(lastX)

    arr.push({ t, x, y, subLength, shift: 0 })
    length += subLength
    lastX = new XY(x, y)
  }
  arr = arr.map((i) => ({ ...i, shift: abs(length / 2 - i.subLength) }))
  arr.sort((a, b) => a.shift - b.shift)

  return { ...arr[0], length }
}

/**
 * 从某个参数t开始分割贝塞尔曲线
 * 返回被分割后的两个贝塞尔曲线的四个控制点坐标
 * 即 [a1x,a1y,a2x,a2y,b1x,b1y,b2x,b2y]
 */
export function bezierDivide(
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  a1x: number,
  a1y: number,
  a2x: number,
  a2y: number,
  t: number
) {
  const A = new XY(p1x, p1y)
  const B = new XY(p2x, p2y)
  const C = new XY(a1x, a1y)
  const D = new XY(a2x, a2y)
  const AC = C.minus(A).multiply(t)
  const BD = D.minus(B).multiply(t)
  const CD = D.minus(C).multiply(t)
  const CD_AC = CD.minus(AC).multiply(t)
  const CD_BD = CD.minus(BD).multiply(t)
  return [...AC.toArray(), ...CD_AC.toArray(), ...CD_BD.toArray(), ...BD.toArray()]
}
