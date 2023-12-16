import { min, tan } from '~/editor/math/base'
import { IBezierType } from '~/editor/schema/type'
import { autobind } from '~/shared/decorator'
import { XY } from '~/shared/structure/xy'
import { IXY } from '~/shared/utils'
import { PathCurve } from './curve'
import { PathLine } from './line'
import { PathNull } from './null'

@autobind
export class PathPoint {
  x = 0
  y = 0
  bezierType: IBezierType = 'no-bezier'
  radius = 0
  left?: PathPoint
  right?: PathPoint
  leftLine?: PathLine
  rightLine?: PathLine
  radian?: number
  maxRadius: number
  leftCurve?: PathCurve
  rightCurve?: PathCurve
  handleLeft?: IXY
  handleRight?: IXY
  leftNull?: PathNull
  rightNull?: PathNull
  jumpToLeft?: boolean
  jumpToRight?: boolean
  arcLength?: number
  constructor(option: {
    x?: number
    y?: number
    bezierType?: IBezierType
    radius?: number
    handleLeft?: IXY
    handleRight?: IXY
    jumpToLeft?: boolean
    jumpToRight?: boolean
  }) {
    const { x, y, bezierType, radius, handleLeft, handleRight, jumpToLeft, jumpToRight } = option!
    this.x = x ? x : this.x
    this.y = y ? y : this.y
    this.bezierType = bezierType ? bezierType : this.bezierType
    this.radius = radius ? radius : this.radius
    this.handleLeft = handleLeft
    this.handleRight = handleRight
    this.jumpToLeft = jumpToLeft
    this.jumpToRight = jumpToRight
    this.maxRadius = this.radius
    this.arcLength = this.calcArcLength()
  }
  get isEnd() {
    return !this.left || !this.right
  }
  get canDrawArc() {
    return this.radius && this.leftLine && this.rightLine && (!this.handleLeft || !this.handleRight)
  }
  get needCulled() {
    return !this.leftLine || !this.rightLine || !this.leftCurve || !this.rightCurve
  }
  calcArcLength() {
    if (!this.canDrawArc) return
    this.arcLength = this.radius / tan(this.radian! / 2)
    return (this.arcLength = min(this.arcLength, this.leftLine!.length, this.rightLine!.length))
  }
  calcRadian() {
    if (!this.canDrawArc) return
    this.radian = this.leftLine!.radianWith(this.rightLine!)
  }
  calcRadiusByArcLength(arcLength: number) {
    return arcLength * tan(this.radian! / 2)
  }
  distanceTo(another: PathPoint) {
    return XY.From(this).distance(another)
  }
  setJumpToRight(jumpToRight: boolean) {
    this.jumpToRight = jumpToRight
    this.right && (this.right.jumpToLeft = jumpToRight)
  }
  connectRight(right: PathPoint) {
    this.right = right
    right.left = this
    if (this.jumpToRight) {
      right.jumpToLeft = true
      this.rightNull = new PathNull(this.right, this)
      right.leftNull = new PathNull(this.right, this)
      return
    }
    if (!this.handleRight && !right.handleLeft) {
      this.rightLine = new PathLine(this, this.right)
      right.leftLine = new PathLine(this.right, this)
    } else {
      this.rightCurve = new PathCurve(this, this.right)
      right.leftCurve = new PathCurve(this.right, this)
    }
  }
}
