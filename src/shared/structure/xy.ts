import { multiply, pow2, rcos, rotatePoint, rsin, sqrt } from '../../editor/math/base'
import { IXY } from '../utils/normal'

export class XY {
  constructor(public x: number, public y: number) {}
  get xy() {
    return { x: this.x, y: this.y }
  }
  set = ({ x, y }: { x?: number; y?: number }) => {
    this.x = x ? x : this.x
    this.y = y ? y : this.y
    return this
  }
  plus = (another: IXY) => {
    return new XY(this.x + another.x, this.y + another.y)
  }
  minus = (another: IXY) => {
    return new XY(this.x - another.x, this.y - another.y)
  }
  multiply = (...numbers: number[]) => {
    const n = multiply(...numbers)
    return new XY(this.x * n, this.y * n)
  }
  divide = (...numbers: number[]) => {
    const n = multiply(...numbers)
    return new XY(this.x / n, this.y / n)
  }
  dot = (another: IXY) => {
    return this.x * another.x + this.y * another.y
  }
  distance = (another: IXY) => {
    return sqrt(pow2(this.x - another.x) + pow2(this.y - another.y))
  }
  rotate = (origin: IXY, degree: number) => {
    return XY.From(rotatePoint(this.x, this.y, origin.x, origin.y, degree))
  }
  shift = (distance: number, rotation: number) => {
    return new XY(this.x + distance * rcos(rotation), this.y + distance * rsin(rotation))
  }
  mutate = (obj: Record<string, any>, prefix?: 'client' | 'center' | (string & {})) => {
    if (prefix) {
      obj[prefix + 'X'] = this.x
      obj[prefix + 'Y'] = this.y
      return obj
    }
    obj.x = this.x
    obj.y = this.y
    return obj
  }
  toArray = () => {
    return [this.x, this.y]
  }
  toObject = (): IXY => {
    return { x: this.x, y: this.y }
  }
  static From(xy: Record<string, any>, prefix?: 'client' | 'center' | (string & {})) {
    if (prefix) return new XY(xy[prefix + 'X'], xy[prefix + 'Y'])
    return new XY(xy.x, xy.y)
  }
  static Of(x: number, y: number) {
    return new XY(x, y)
  }
  static Plus(...xys: XY[]) {
    return xys.reduce((i, all) => all.plus(i), new XY(0, 0))
  }
}
