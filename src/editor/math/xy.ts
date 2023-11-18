import { m, pow2, sqrt } from './util'

export class XY {
  constructor(public x: number, public y: number) {}
  plus(another: XY) {
    return new XY(this.x + another.x, this.y + another.y)
  }
  minus(another: XY) {
    return new XY(this.x - another.x, this.y - another.y)
  }
  multiNum(...numbers: number[]) {
    const n = m(...numbers)
    return new XY(this.x * n, this.y * n)
  }
  distance(another: XY) {
    return sqrt(pow2(this.x - another.x) + pow2(this.y - another.y))
  }
  toArray() {
    return [this.x, this.y]
  }
  static Plus(...xys: XY[]) {
    return xys.reduce((i, all) => all.plus(i), new XY(0, 0))
  }
}

export function distance(x1: number, y1: number, x2: number, y2: number) {
  return sqrt(pow2(x2 - x1) + pow2(y2 - y1))
}
export const d = distance
