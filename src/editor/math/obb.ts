import { IRect, IXY } from '~/shared/utils/normal'
import { abs, rcos, rsin } from './base'
import { xy_, xy_dot, xy_minus, xy_rotate } from './xy'

type IAxis = { widthAxis: IXY; heightAxis: IXY }

export class OBB {
  xy: IXY
  axis: IAxis
  aabb: IRect
  constructor(
    public centerX: number,
    public centerY: number,
    public width: number,
    public height: number,
    public rotation: number
  ) {
    this.xy = this.calcXY()
    this.axis = this.calcAxis()
    this.aabb = this.calcAABB()
  }
  get center() {
    return { x: this.centerX, y: this.centerY }
  }
  shiftX(x: number) {
    this.xy.x += x
    this.centerX += x
    this.aabb.x += x
  }
  shiftY(y: number) {
    this.xy.y += y
    this.centerY += y
    this.aabb.y += y
  }
  reBound(width?: number, height?: number, centerX?: number, centerY?: number) {
    if (width) this.width = width
    if (height) this.height = height
    if (centerX) this.centerX = centerX
    if (centerY) this.centerY = centerY
    this.calcAABB()
  }
  reRotation(rotation: number) {
    this.rotation = rotation
    this.calcXY()
    this.calcAxis()
    this.calcAABB()
  }
  calcXY() {
    return (this.xy = xy_rotate(
      xy_(this.centerX - this.width / 2, this.centerY - this.height / 2),
      this.center,
      this.rotation
    ))
  }
  calcAxis() {
    const cos = rcos(this.rotation)
    const sin = rsin(this.rotation)
    const widthAxis = xy_(cos, -sin)
    const heightAxis = xy_(sin, cos)
    return (this.axis = { widthAxis, heightAxis })
  }
  calcAABB() {
    const width = this.projectionLengthAt(xy_(1, 0))
    const height = this.projectionLengthAt(xy_(0, 1))
    return (this.aabb = {
      x: this.center.x - width / 2,
      y: this.center.y - height / 2,
      width,
      height,
    })
  }
  calcVertexXY() {
    const halfWidth = this.width / 2
    const halfHeight = this.height / 2
    let TL = xy_(this.centerX - halfWidth, this.centerY - halfHeight)
    let TR = xy_(this.centerX + halfWidth, this.centerY - halfHeight)
    let BL = xy_(this.centerX - halfWidth, this.centerY + halfHeight)
    let BR = xy_(this.centerX + halfWidth, this.centerY + halfHeight)
    TL = xy_rotate(TL, this.center, this.rotation)
    TR = xy_rotate(TR, this.center, this.rotation)
    BL = xy_rotate(BL, this.center, this.rotation)
    BR = xy_rotate(BR, this.center, this.rotation)
    return [TL, TR, BR, BL]
  }
  aabbHitTest(another: OBB) {
    return (
      this.aabb.x < another.aabb.x + another.aabb.width &&
      this.aabb.x + this.aabb.width > another.aabb.x &&
      this.aabb.y < another.aabb.y + another.aabb.height &&
      this.aabb.height + this.aabb.y > another.aabb.y
    )
  }
  obbHitTest(another: OBB) {
    const lineVector = xy_minus(this.center, another.center)
    if (
      this.projectionLengthAt(another.axis.widthAxis) + another.width <=
      2 * abs(xy_dot(lineVector, another.axis.widthAxis))
    )
      return false
    if (
      this.projectionLengthAt(another.axis.heightAxis) + another.height <=
      2 * abs(xy_dot(lineVector, another.axis.heightAxis))
    )
      return false
    if (
      another.projectionLengthAt(this.axis.widthAxis) + this.width <=
      2 * abs(xy_dot(lineVector, this.axis.widthAxis))
    )
      return false
    if (
      another.projectionLengthAt(this.axis.heightAxis) + this.height <=
      2 * abs(xy_dot(lineVector, this.axis.heightAxis))
    )
      return false
    return true
  }
  projectionLengthAt(anotherAxis: IXY) {
    const { widthAxis, heightAxis } = this.axis
    return (
      abs(xy_dot(widthAxis, anotherAxis)) * this.width +
      abs(xy_dot(heightAxis, anotherAxis)) * this.height
    )
  }
  getAABBBound(aabb?: IRect) {
    const { x, y, width, height } = aabb || this.aabb
    const [left, right] = [x, x + width]
    const [top, bottom] = [y, y + height]
    const [centerX, centerY] = [x + width / 2, y + height / 2]
    return { left, right, top, bottom, centerX, centerY }
  }
}
