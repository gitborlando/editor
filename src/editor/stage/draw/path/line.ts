import { abs, atan, radianfy } from '~/editor/math/base'
import { autobind } from '~/shared/decorator'
import { XY } from '~/shared/structure/xy'
import { pipe } from '~/shared/utils'
import { PathPoint } from './point'

@autobind
export class PathLine {
  readonly type = 'line' as const
  length: number
  slope: number
  constructor(public start: PathPoint, public end: PathPoint) {
    this.length = this.calcLength()
    this.slope = this.calcSlope()
  }
  calcLength() {
    return (this.length = this.start.distanceTo(this.end))
  }
  calcSlope() {
    return (this.slope = (this.end.y - this.start.y) / (this.end.x - this.start.x))
  }
  calcXYInSomeRatio(ratio: number) {
    return XY.Plus(
      XY.From(this.start).multiply(1 - ratio),
      XY.From(this.end).multiply(ratio)
    ).toObject()
  }
  calcXYInSomeDistance(distance: number) {
    return this.calcXYInSomeRatio(distance / this.length)
  }
  calcMiddleXY() {
    return this.calcXYInSomeRatio(0.5)
  }
  radianWith(another: PathLine) {
    if (this.slope === 0 && another.slope === 0) return 0
    if (this.slope === Infinity && another.slope === Infinity) return 0
    if (this.slope === 0 && another.slope === Infinity) return radianfy(90)
    if (this.slope === Infinity && another.slope === 0) return radianfy(90)
    if (this.slope === 0) return pipe(another.slope).to(atan, abs)
    if (this.slope === Infinity) return pipe(1 / another.slope).to(atan, abs)
    if (another.slope === 0) return pipe(this.slope).to(atan, abs)
    if (another.slope === Infinity) return pipe(1 / this.slope).to(atan, abs)
    return pipe((another.slope - this.slope) / (1 + another.slope * this.slope)).to(atan, abs)
  }
}
