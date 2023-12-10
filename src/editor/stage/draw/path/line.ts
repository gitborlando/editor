import { makeAutoObservable } from 'mobx'
import { autobind } from '~/editor/helper/decorator'
import { pipe } from '~/editor/helper/utils'
import { abs, atan, radianfy } from '~/editor/math/base'
import { XY } from '~/editor/math/xy'
import { PathPoint } from './point'

@autobind
export class PathLine {
  readonly type = 'line' as const
  constructor(public start: PathPoint, public end: PathPoint) {
    makeAutoObservable(this)
  }
  get length() {
    return this.start.distanceTo(this.end)
  }
  get slope() {
    return (this.end.y - this.start.y) / (this.end.x - this.start.x)
  }
  get middleXY() {
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
  calcXYInSomeRatio(ratio: number) {
    return XY.Plus(
      XY.From(this.start).multiply(1 - ratio),
      XY.From(this.end).multiply(ratio)
    ).toObject()
  }
  calcXYInSomeDistance(distance: number) {
    return this.calcXYInSomeRatio(distance / this.length)
  }
}
