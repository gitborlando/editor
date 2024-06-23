import { IRect, IXY } from 'src/shared/utils/normal'
import { abs, max, min, rcos, rsin } from './base'
import { xy_, xy_dot, xy_minus, xy_rotate } from './xy'

type IAxis = { widthAxis: IXY; heightAxis: IXY }

export class OBB {
  center: IXY
  axis: IAxis
  aabb: AABB
  vertexes: [IXY, IXY, IXY, IXY]

  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public rotation: number
  ) {
    this.center = this.calcCenter()
    this.axis = this.calcAxis()
    this.vertexes = this.calcVertexXY()
    this.aabb = AABB.FromOBB(this)
  }

  get xy() {
    return xy_(this.x, this.y)
  }

  private calcCenter = () => {
    const center = xy_(this.x + this.width / 2, this.y + this.height / 2)
    return xy_rotate(center, xy_(this.x, this.y), this.rotation)
  }

  private calcAxis = () => {
    const cos = rcos(this.rotation)
    const sin = rsin(this.rotation)
    const widthAxis = xy_(cos, -sin)
    const heightAxis = xy_(sin, cos)
    return (this.axis = { widthAxis, heightAxis })
  }

  calcVertexXY = () => {
    const cos = rcos(this.rotation)
    const sin = rsin(this.rotation)
    const cosWidth = cos * this.width
    const sinWidth = sin * this.width
    const cosHeight = cos * this.height
    const sinHeight = sin * this.height
    const TL = xy_(this.x, this.y)
    const TR = xy_(this.x + cosWidth, this.y + sinWidth)
    const BR = xy_(this.x + cosWidth - sinHeight, this.y + sinWidth + cosHeight)
    const BL = xy_(this.x - sinHeight, this.y + cosHeight)
    return (this.vertexes = [TL, TR, BR, BL])
  }

  clone = () => {
    return new OBB(this.x, this.y, this.width, this.height, this.rotation)
  }

  projectionLengthAt = (anotherAxis: IXY) => {
    const { widthAxis, heightAxis } = this.axis
    return (
      abs(xy_dot(widthAxis, anotherAxis)) * this.width +
      abs(xy_dot(heightAxis, anotherAxis)) * this.height
    )
  }

  collide = (another: OBB) => {
    const centerVector = xy_minus(this.center, another.center)
    if (
      this.projectionLengthAt(another.axis.widthAxis) + another.width <=
      2 * abs(xy_dot(centerVector, another.axis.widthAxis))
    )
      return false
    if (
      this.projectionLengthAt(another.axis.heightAxis) + another.height <=
      2 * abs(xy_dot(centerVector, another.axis.heightAxis))
    )
      return false
    if (
      another.projectionLengthAt(this.axis.widthAxis) + this.width <=
      2 * abs(xy_dot(centerVector, this.axis.widthAxis))
    )
      return false
    if (
      another.projectionLengthAt(this.axis.heightAxis) + this.height <=
      2 * abs(xy_dot(centerVector, this.axis.heightAxis))
    )
      return false
    return true
  }

  static IdentityOBB() {
    return new OBB(0, 0, 0, 0, 0)
  }

  static FromRect(rect: IRect, rotation = 0) {
    const { x, y, width, height } = rect
    return new OBB(x, y, width, height, rotation)
  }

  static FromAABB(aabb: AABB) {
    const { minX, minY, maxX, maxY } = aabb
    return new OBB(minX, minY, maxX - minX, maxY - minY, 0)
  }
}

export class AABB {
  constructor(public minX: number, public minY: number, public maxX: number, public maxY: number) {}

  static Collide(one: AABB, another: AABB) {
    return (
      one.minX <= another.maxX &&
      one.maxX >= another.minX &&
      one.minY <= another.maxY &&
      one.maxY >= another.minY
    )
  }

  static Include(one: AABB, another: AABB) {
    let result = 1
    let [large, small] = [one, another]
    if (one.maxX - one.minX < another.maxX - another.minX) {
      result = 0
      large = another
      small = one
    }
    const included =
      large.minX <= small.minX &&
      large.maxX >= small.maxX &&
      large.minY <= small.minY &&
      large.maxY >= small.maxY
    return included ? result : -1
  }

  static Expand(aabb: AABB, ...expands: [number] | [number, number, number, number]): AABB {
    const { minX, minY, maxX, maxY } = aabb
    if (expands.length === 1) {
      const expand = expands[0]
      return new AABB(minX - expand, minY - expand, maxX + expand, maxY + expand)
    } else {
      return new AABB(minX - expands[0], minY - expands[1], maxX + expands[2], maxY + expands[3])
    }
  }

  static Merge(aabbList: AABB[]) {
    let [xMin, yMin, xMax, yMax] = [Infinity, Infinity, -Infinity, -Infinity]
    aabbList.forEach((aabb) => {
      xMin = min(xMin, aabb.minX)
      yMin = min(yMin, aabb.minY)
      xMax = max(xMax, aabb.maxX)
      yMax = max(yMax, aabb.maxY)
    })
    return new AABB(xMin, yMin, xMax, yMax)
  }

  static FromOBB(obb: OBB) {
    const width = obb.projectionLengthAt(xy_(1, 0))
    const height = obb.projectionLengthAt(xy_(0, 1))
    return new AABB(
      obb.center.x - width / 2,
      obb.center.y - height / 2,
      obb.center.x + width / 2,
      obb.center.y + height / 2
    )
  }
}
