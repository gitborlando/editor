import { abs } from '~/editor/math/base'
import { IFillLinearGradient } from '~/editor/schema/type'
import { PIXI } from '~/editor/stage/pixi'

export function createLinearGradientTexture({
  start,
  end,
  stops,
}: Omit<IFillLinearGradient, 'type'>) {
  const canvas = document.createElement('canvas')
  canvas.width = abs(start.x - end.x)
  canvas.height = abs(start.y - end.y)
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y)
  stops.forEach(({ offset, color }) => gradient.addColorStop(offset, color))
  ctx.fillStyle = gradient
  ctx.fillRect(start.x, start.y, end.x, end.y)
  return PIXI.Texture.from(canvas)
}
