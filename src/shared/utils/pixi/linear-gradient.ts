import { xy_distance } from '~/editor/math/xy'
import { IFillLinearGradient } from '~/editor/schema/type'
import { PIXI } from '~/editor/stage/pixi'
import { rgbaString } from '../color'

export function createLinearGradientTexture({
  start,
  end,
  stops,
}: Omit<IFillLinearGradient, 'type'>) {
  const canvas = document.createElement('canvas')
  const length = xy_distance(start, end)
  canvas.width = length
  canvas.height = 1
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createLinearGradient(0, 0, length, 1)
  stops.forEach(({ offset, color }) => {
    gradient.addColorStop(offset, rgbaString(color))
  })
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, length, 1)
  return PIXI.Texture.from(canvas)
}
