import { XY } from '~/shared/structure/xy'
import { IBound, IXY } from '~/shared/utils'
import { abs, rcos, rsin } from './base'

type IAxis = { widthAxis: XY; heightAxis: XY }

export class OBB {
  center: XY
  axis: IAxis
  aabb: IBound
  vertexes: { TL: IXY; TR: IXY; BR: IXY; BL: IXY }
  vertexArr: [IXY, IXY, IXY, IXY]
  constructor(
    public centerX: number,
    public centerY: number,
    public width: number,
    public height: number,
    public rotation: number,
    public scaleX: number,
    public scaleY: number
  ) {
    this.center = this.calcCenter()
    this.axis = this.calcAxis()
    this.aabb = this.calcAABB()
    this.vertexes = this.calcVertexXY()
    this.vertexArr = <[IXY, IXY, IXY, IXY]>Object.values(this.vertexes)
  }
  shift = ({ x, y }: Partial<IXY>) => {
    if (x) {
      this.centerX += x
      this.aabb.x += x
      this.vertexArr.forEach((i) => (i.x += x))
    }
    if (y) {
      this.centerY += y
      this.aabb.y += y
      this.vertexArr.forEach((i) => (i.y += y))
    }
  }
  calcCenter = () => {
    return (this.center = XY.Of(this.centerX, this.centerY))
  }
  calcAxis = () => {
    const cos = rcos(this.rotation)
    const sin = rsin(this.rotation)
    const widthAxis = XY.Of(cos, -sin)
    const heightAxis = XY.Of(sin, cos)
    return (this.axis = { widthAxis, heightAxis })
  }
  calcAABB = () => {
    const width = this.projectionLengthAt(XY.Of(1, 0))
    const height = this.projectionLengthAt(XY.Of(0, 1))
    return (this.aabb = {
      x: this.center.x - width / 2,
      y: this.center.y - height / 2,
      width,
      height,
    })
  }
  calcVertexXY = () => {
    const halfWidth = this.width / 2
    const halfHeight = this.height / 2
    const TL = XY.Of(this.centerX - halfWidth, this.centerY - halfHeight)
      .rotate(this.center, this.rotation)
      .toObject()
    const TR = XY.Of(this.centerX + halfWidth, this.centerY - halfHeight)
      .rotate(this.center, this.rotation)
      .toObject()
    const BR = XY.Of(this.centerX + halfWidth, this.centerY + halfHeight)
      .rotate(this.center, this.rotation)
      .toObject()
    const BL = XY.Of(this.centerX - halfWidth, this.centerY + halfHeight)
      .rotate(this.center, this.rotation)
      .toObject()
    return (this.vertexes = { TL, TR, BR, BL })
  }
  hitTest = (another: OBB) => {
    const simpleTest = this.simpleHitTest(another)
    if (specialRotationSet.has(this.rotation)) return simpleTest
    return simpleTest && this.complexHitTest(another)
  }
  projectionLengthAt = (anotherAxis: XY) => {
    const { widthAxis, heightAxis } = this.axis
    return (
      abs(widthAxis.dot(anotherAxis)) * this.width + abs(heightAxis.dot(anotherAxis)) * this.height
    )
  }
  simpleHitTest = (another: OBB) => {
    return (
      this.aabb.x < another.aabb.x + another.aabb.width &&
      this.aabb.x + this.aabb.width > another.aabb.x &&
      this.aabb.y < another.aabb.y + another.aabb.height &&
      this.aabb.height + this.aabb.y > another.aabb.y
    )
  }
  complexHitTest = (another: OBB) => {
    const lineVector = this.center.minus(another.center)
    if (
      this.projectionLengthAt(another.axis.widthAxis) + another.width <=
      2 * abs(lineVector.dot(another.axis.widthAxis))
    )
      return false
    if (
      this.projectionLengthAt(another.axis.heightAxis) + another.height <=
      2 * abs(lineVector.dot(another.axis.heightAxis))
    )
      return false
    if (
      another.projectionLengthAt(this.axis.widthAxis) + this.width <=
      2 * abs(lineVector.dot(this.axis.widthAxis))
    )
      return false
    if (
      another.projectionLengthAt(this.axis.heightAxis) + this.height <=
      2 * abs(lineVector.dot(this.axis.heightAxis))
    )
      return false
    return true
  }
}

const specialRotationSet = new Set([-180, -90, 0, 90, 180])
