import { makeAutoObservable } from 'mobx'
import { autobind } from '~/editor/helper/decorator'
import { PathPoint } from './point'

@autobind
export class PathCurve {
  readonly type = 'curve' as const
  constructor(public start: PathPoint, public end: PathPoint) {
    makeAutoObservable(this)
  }
}
