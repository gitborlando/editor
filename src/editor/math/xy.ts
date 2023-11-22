import { IXY, multiply, pow2, sqrt } from '../utils'

export class XY {
  constructor(public x: number, public y: number) {}
  plus(another: IXY) {
    return new XY(this.x + another.x, this.y + another.y)
  }
  minus(another: IXY) {
    return new XY(this.x - another.x, this.y - another.y)
  }
  multiply(...numbers: number[]) {
    const n = multiply(...numbers)
    return new XY(this.x * n, this.y * n)
  }
  divide(...numbers: number[]) {
    const n = multiply(...numbers)
    return new XY(this.x / n, this.y / n)
  }
  update(xy: IXY) {
    this.x = xy.x
    this.y = xy.y
  }
  distance(another: IXY) {
    return sqrt(pow2(this.x - another.x) + pow2(this.y - another.y))
  }
  toArray() {
    return [this.x, this.y]
  }
  toObject() {
    return { x: this.x, y: this.y }
  }
  static from<T extends IXY>(xy: T) {
    return new XY(xy.x, xy.y)
  }
  static plusAll(...xys: XY[]) {
    return xys.reduce((i, all) => all.plus(i), new XY(0, 0))
  }
}

export function distance(x1: number, y1: number, x2: number, y2: number) {
  return sqrt(pow2(x2 - x1) + pow2(y2 - y1))
}
export const d = distance
