import autobind from 'class-autobind-decorator'
import { ILoopArrayCallbackData, LoopArray } from '~/shared/structure/loop-array'
import { PathCurve } from './curve'
import { PathLine } from './line'
import { PathNull } from './null'
import { PathPoint } from './point'

export type PathLineOrCurveOrNull = PathLine | PathCurve | PathNull

@autobind
export class Path {
  lines: PathLineOrCurveOrNull[]
  constructor(public points: PathPoint[]) {
    this.connectPoints()
    this.lines = this.calcLines()
  }
  calcLines() {
    return (this.lines = LoopArray.From(this.points).reduce(({ cur, init: lines }) => {
      lines.push((cur.rightLine || cur.rightCurve || cur.rightNull)!)
      return lines
    }, <PathLineOrCurveOrNull[]>[]))
  }
  forEachPoint(callback: (data: ILoopArrayCallbackData<PathPoint>) => void) {
    LoopArray.From(this.points).forEach(callback)
  }
  forEachLine(callback: (data: ILoopArrayCallbackData<PathLineOrCurveOrNull>) => void) {
    LoopArray.From(this.lines).forEach(callback)
  }
  private connectPoints() {
    LoopArray.From(this.points)
      .forEach(({ cur, next }) => cur.connectRight(next))
      .forEach(({ cur }) => cur.calcRadian())
      .toRaw()
  }
}
