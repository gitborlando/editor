import { IXY } from '../utility/utils'
import { multiply, pow2, sqrt } from './base'

export class XY {
  constructor(public x: number, public y: number) {}
  set({ x, y }: { x?: number; y?: number }) {
    this.x = x ? x : this.x
    this.y = y ? y : this.y
  }
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
  distance(another: IXY) {
    return sqrt(pow2(this.x - another.x) + pow2(this.y - another.y))
  }
  toArray() {
    return [this.x, this.y]
  }
  toObject(): IXY {
    return { x: this.x, y: this.y }
  }
  static From<T extends IXY>(xy: T) {
    return new XY(xy.x, xy.y)
  }
  static Of(x: number, y: number) {
    return new XY(x, y)
  }
  static Plus(...xys: XY[]) {
    return xys.reduce((i, all) => all.plus(i), new XY(0, 0))
  }
}

export function distance(x1: number, y1: number, x2: number, y2: number) {
  return sqrt(pow2(x2 - x1) + pow2(y2 - y1))
}
export const d = distance
