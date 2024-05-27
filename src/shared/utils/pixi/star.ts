import { max, rcos, rsin } from 'src/editor/math/base'

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
      return { x, y }
    } else {
      const x = centerX + rcos(angle) * radius * (width / height)
      const y = centerY + rsin(angle) * radius
      return { x, y }
    }
  })
}
