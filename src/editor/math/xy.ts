import { IXY } from '~/shared/utils/normal'
import { degreefy, rotatePoint } from './base'

export function xy_(x: number, y: number) {
  return { x, y }
}

export function xy_mutate(self: IXY, another: IXY) {
  self.x = another.x
  self.y = another.y
}

export function xy_plus(self: IXY, another: IXY) {
  return { x: self.x + another.x, y: self.y + another.y }
}
export function xy_plus_mutate(self: IXY, another: IXY) {
  self.x = self.x + another.x
  self.y = self.y + another.y
}

export function xy_minus(self: IXY, another: IXY) {
  return { x: self.x - another.x, y: self.y - another.y }
}
export function xy_minus_mutate(self: IXY, another: IXY) {
  self.x = self.x - another.x
  self.y = self.y - another.y
}

export function xy_distance(self: IXY, another: IXY) {
  return Math.sqrt((self.x - another.x) ** 2 + (self.y - another.y) ** 2)
}

export function xy_rotate(self: IXY, origin: IXY, rotation: number) {
  return rotatePoint(self.x, self.y, origin.x, origin.y, rotation)
}
export function xy_rotate2(self: IXY, originX: number, originY: number, rotation: number) {
  return rotatePoint(self.x, self.y, originX, originY, rotation)
}
export function xy_rotate3(selfX: number, selfY: number, origin: IXY, rotation: number): IXY {
  return rotatePoint(selfX, selfY, origin.x, origin.y, rotation)
}

export function xy_dot(self: IXY, another: IXY) {
  return self.x * another.x + self.y * another.y
}

export function xy_symmetric(self: IXY, origin: IXY) {
  return { x: 2 * origin.x - self.x, y: 2 * origin.y - self.y }
}

export function xy_opposite(self: IXY) {
  return { x: -self.x, y: -self.y }
}

//两点关于另一点的夹角
export function xy_angle(self: IXY, another: IXY, origin: IXY) {
  const self2origin = xy_minus(self, origin)
  const another2origin = xy_minus(another, origin)
  return degreefy(
    Math.atan2(self2origin.y, self2origin.x) - Math.atan2(another2origin.y, another2origin.x)
  )
}
