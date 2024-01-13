import { max, rcos, rsin } from '~/editor/math/base'

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
      return { x, y }
    } else {
      const x = centerX + rcos(angle) * radius * (width / height)
      const y = centerY + rsin(angle) * radius
      return { x, y }
    }
  })
}
