import { IXY } from '~/shared/utils'
import { rotatePoint } from './base'

export function xy_mutate(self: IXY, another: IXY) {
  self.x = another.x
  self.y = another.y
}
export function xy_mutate2(self: IXY, x: number, y: number) {
  self.x = x
  self.y = y
}

export function xy_plus(self: IXY, another: IXY) {
  self.x = self.x + another.x
  self.y = self.y + another.y
}
export function xy_plus2(self: IXY, x: number, y: number) {
  self.x = self.x + x
  self.y = self.y + y
}

export function xy_distance(self: IXY, another: IXY) {
  return Math.sqrt((self.x - another.x) ** 2 + (self.y - another.y) ** 2)
}
export function xy_distance2(self: IXY, x: number, y: number) {
  return Math.sqrt((self.x - x) ** 2 + (self.y - y) ** 2)
}

export function xy_rotate(self: IXY, origin: IXY, rotation: number) {
  const rotatedXY = rotatePoint(self.x, self.y, origin.x, origin.y, rotation)
  xy_mutate(self, rotatedXY)
}
export function xy_rotate2(self: IXY, originX: number, originY: number, rotation: number) {
  const rotatedXY = rotatePoint(self.x, self.y, originX, originY, rotation)
  xy_mutate(self, rotatedXY)
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
