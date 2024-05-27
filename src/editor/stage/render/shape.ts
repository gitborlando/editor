import { max, rcos, rsin } from 'src/editor/math/base'
import { xy_ } from 'src/editor/math/xy'
import { SchemaDefault } from 'src/editor/schema/default'
import { IXY } from 'src/shared/utils/normal'

export function createRectPoints(x: number, y: number, w: number, h: number, r: number) {
  const points = <IXY[]>[]

  if (r === 0) {
    points.push(xy_(x, y))
    points.push(xy_(x + w, y))
    points.push(xy_(x + w, y + h))
    points.push(xy_(x, y + h))
  } else {
    const cos = rcos(r)
    const sin = rsin(r)
    const x1 = x + w / 2
    const y1 = y + h / 2
    const x2 = x1 + (w / 2) * cos
    const y2 = y1 + (h / 2) * sin
    const x3 = x1 - (w / 2) * sin
    const y3 = y1 + (h / 2) * cos
    const x4 = x + w / 2
    const y4 = y + h / 2
    points.push(xy_(x1, y1))
  }
}

export function createRegularPolygon(width: number, height: number, sides: number, rotation = 0) {
  sides = Math.max(sides | 0, 3)
  const centerX = width / 2
  const centerY = height / 2
  const radius = max(width, height) / 2
  const startAngle = rotation - 90
  const delta = 360 / sides
  const isFlatShape = width > height
  return new Array(sides).fill(null).map((_, i) => {
    const angle = i * delta + startAngle
    if (isFlatShape) {
      const x = centerX + rcos(angle) * radius
      const y = centerY + rsin(angle) * radius * (height / width)
      return SchemaDefault.point({ x, y })
    } else {
      const x = centerX + rcos(angle) * radius * (width / height)
      const y = centerY + rsin(angle) * radius
      return SchemaDefault.point({ x, y })
    }
  })
}

export function createStarPolygon(
  width: number,
  height: number,
  points: number,
  innerRate: number,
  rotation = 0
) {
  points = max(points | 0, 3)
  const centerX = width / 2
  const centerY = height / 2
  const outerRadius = max(width, height) / 2
  const innerRadius = innerRate * outerRadius
  const startAngle = rotation - 90
  const delta = 360 / points / 2
  const isFlatShape = width > height
  return new Array(points * 2).fill(null).map((_, i) => {
    const radius = (-1) ** i === 1 ? outerRadius : innerRadius
    const angle = i * delta + startAngle
    if (isFlatShape) {
      const x = centerX + rcos(angle) * radius
      const y = centerY + rsin(angle) * radius * (height / width)
      return SchemaDefault.point({ x, y })
    } else {
      const x = centerX + rcos(angle) * radius * (width / height)
      const y = centerY + rsin(angle) * radius
      return SchemaDefault.point({ x, y })
    }
  })
}
