import { makeAutoObservable } from 'mobx'
import { autobind } from '~/editor/helper/decorator'
import { IXY } from '~/editor/helper/utils'
import { min, tan } from '~/editor/math/base'
import { XY } from '~/editor/math/xy'
import { IBezierType } from '~/editor/schema/type'
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
    makeAutoObservable(this)
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
  }
  get isEnd() {
    return !this.left || !this.right
  }
  get canDrawArc() {
    return this.leftLine && this.rightLine && (!this.handleLeft || !this.handleRight)
  }
  get arcLength() {
    if (!this.canDrawArc) return
    const arcLength = this.radius / tan(this.radian! / 2)
    return min(arcLength, this.leftLine!.length, this.rightLine!.length)
  }
  get needCulled() {
    return !this.leftLine || !this.rightLine || !this.leftCurve || !this.rightCurve
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
  distanceTo(another: PathPoint) {
    return XY.From(this).distance(another)
  }
  setJumpToRight(jumpToRight: boolean) {
    this.jumpToRight = jumpToRight
    this.right && (this.right.jumpToLeft = jumpToRight)
  }
  calcRadian() {
    if (!this.canDrawArc) return
    this.radian = this.leftLine!.radianWith(this.rightLine!)
  }
  calcRadiusByArcLength(arcLength: number) {
    return arcLength * tan(this.radian! / 2)
  }
}