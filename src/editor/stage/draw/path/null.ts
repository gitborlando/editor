import { autobind } from '~/shared/decorator'
import { PathPoint } from './point'

@autobind
export class PathNull {
  readonly type = 'null' as const
  constructor(public start: PathPoint, public end: PathPoint) {}
}
