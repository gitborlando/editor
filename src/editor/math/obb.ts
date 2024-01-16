import autobind from 'class-autobind-decorator'
import { XY } from '~/shared/structure/xy'
import { IBound, IXY } from '~/shared/utils/normal'
import { abs, rcos, rsin } from './base'
import { xy_dot, xy_minus, xy_rotate3 } from './xy'

type IAxis = { widthAxis: XY; heightAxis: XY }

@autobind
export class OBB {
  xy: IXY
  axis: IAxis
  aabb: IBound
  vertexes: [IXY, IXY, IXY, IXY]
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
    this.vertexes = this.calcVertexXY()
  }
  get center() {
    return { x: this.centerX, y: this.centerY }
  }
  shift(x?: number, y?: number) {
    this.xy.x += x ?? 0
    this.xy.y += y ?? 0
    this.centerX += x ?? 0
    this.centerY += y ?? 0
    this.aabb.x += x ?? 0
    this.aabb.y += y ?? 0
    this.vertexes.forEach((vertex) => {
      vertex.x += x ?? 0
      vertex.y += y ?? 0
    })
  }
  reBound(width?: number, height?: number, centerX?: number, centerY?: number) {
    if (width) this.width = width
    if (height) this.height = height
    if (centerX) this.centerX = centerX
    if (centerY) this.centerY = centerY
    this.calcAABB()
    this.calcVertexXY()
  }
  reRotation(rotation: number) {
    this.rotation = rotation
    this.calcXY()
    this.calcAxis()
    this.calcAABB()
    this.calcVertexXY()
  }
  calcXY() {
    return (this.xy = xy_rotate3(
      this.centerX - this.width / 2,
      this.centerY - this.height / 2,
      this.center,
      this.rotation
    ))
  }
  calcAxis() {
    const cos = rcos(this.rotation)
    const sin = rsin(this.rotation)
    const widthAxis = XY.Of(cos, -sin)
    const heightAxis = XY.Of(sin, cos)
    return (this.axis = { widthAxis, heightAxis })
  }
  calcAABB() {
    const width = this.projectionLengthAt(XY.Of(1, 0))
    const height = this.projectionLengthAt(XY.Of(0, 1))
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
    const TL = xy_rotate3(
      this.centerX - halfWidth,
      this.centerY - halfHeight,
      this.center,
      this.rotation
    )
    const TR = xy_rotate3(
      this.centerX + halfWidth,
      this.centerY - halfHeight,
      this.center,
      this.rotation
    )
    const BR = xy_rotate3(
      this.centerX + halfWidth,
      this.centerY + halfHeight,
      this.center,
      this.rotation
    )
    const BL = xy_rotate3(
      this.centerX - halfWidth,
      this.centerY + halfHeight,
      this.center,
      this.rotation
    )
    return (this.vertexes = [TL, TR, BR, BL])
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
  projectionLengthAt(anotherAxis: XY) {
    const { widthAxis, heightAxis } = this.axis
    return (
      abs(xy_dot(widthAxis, anotherAxis)) * this.width +
      abs(xy_dot(heightAxis, anotherAxis)) * this.height
    )
  }
}
