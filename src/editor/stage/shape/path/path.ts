import { makeAutoObservable } from 'mobx'
import { autobind } from '~/editor/utility/decorator'
import { ILoopArrayCallbackData, LoopArray } from '~/editor/utility/loop-array'
import { PathCurve } from './curve'
import { PathLine } from './line'
import { PathNull } from './null'
import { PathPoint } from './point'

export type PathLineOrCurveOrNull = PathLine | PathCurve | PathNull

@autobind
export class Path {
  constructor(public points: PathPoint[]) {
    this.connectPoints()
    makeAutoObservable(this)
  }
  get lines() {
    return LoopArray.From(this.points).reduce(({ cur, init: lines }) => {
      lines.push((cur.rightLine || cur.rightCurve || cur.rightNull)!)
      return lines
    }, <PathLineOrCurveOrNull[]>[])
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
