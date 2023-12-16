import { IXY } from '~/shared/utils'
import { rotatePoint } from './base'

export function xy_new(x: number, y: number) {
  return { x, y }
}

export function xy_mutate(self: IXY, another: IXY) {
  self.x = another.x
  self.y = another.y
}
export function xy_mutate2(self: IXY, x: number, y: number) {
  self.x = x
  self.y = y
}

export function xy_plus_mutate(self: IXY, another: IXY) {
  self.x = self.x + another.x
  self.y = self.y + another.y
}
export function xy_plus2(self: IXY, x: number, y: number) {
  self.x = self.x + x
  self.y = self.y + y
}

export function xy_minus_self(self: IXY, another: IXY) {
  self.x = self.x - another.x
  self.y = self.y - another.y
}
export function xy_minus(self: IXY, another: IXY) {
  return { x: self.x - another.x, y: self.y - another.y }
}

export function xy_distance(self: IXY, another: IXY) {
  return Math.sqrt((self.x - another.x) ** 2 + (self.y - another.y) ** 2)
}
export function xy_distance2(self: IXY, x: number, y: number) {
  return Math.sqrt((self.x - x) ** 2 + (self.y - y) ** 2)
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
export function xy_rotate4(
  selfX: number,
  selfY: number,
  originX: number,
  originY: number,
  rotation: number
): IXY {
  return rotatePoint(selfX, selfY, originX, originY, rotation)
}

export function xy_dot(self: IXY, another: IXY) {
  return self.x * another.x + self.y * another.y
}
