import { Graphics } from 'pixi.js'

export function drawRegularPolygon(
  element: Graphics,
  x: number,
  y: number,
  radius: number,
  sides: number,
  rotation = 0
) {
  sides = Math.max(sides | 0, 3)
  const startAngle = (-1 * Math.PI) / 2 + rotation
  const delta = (Math.PI * 2) / sides
  const polygon = []
  for (let i = 0; i < sides; i++) {
    const angle = i * delta + startAngle
    polygon.push(x + radius * Math.cos(angle), y + radius * Math.sin(angle))
  }
  return element.drawPolygon(polygon)
}
