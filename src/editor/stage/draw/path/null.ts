import { makeAutoObservable } from 'mobx'
import { autobind } from '~/editor/helper/decorator'
import { PathPoint } from './point'

@autobind
export class PathNull {
  readonly type = 'null' as const
  constructor(public start: PathPoint, public end: PathPoint) {
    makeAutoObservable(this)
  }
}
