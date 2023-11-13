import { Context } from 'konva/lib/Context'
import { IXY, radianfy } from '~/helper/utils'

export function drawEllipse(
  ctx: Context,
  center: IXY,
  radius: IXY,
  rotation: number,
  startRadian: number,
  endRadian: number,
  innerRate: number
): void {
  ctx.beginPath()

  if (innerRate === 0) {
    if (endRadian !== radianfy(360)) {
      ctx.ellipse(center.x, center.y, radius.x, radius.y, rotation, startRadian, endRadian)
      ctx.lineTo(center.x, center.y)
    } else {
      ctx.ellipse(center.x, center.y, radius.x, radius.y, rotation, startRadian, endRadian)
    }
  } else {
    if (endRadian !== radianfy(360)) {
      ctx.ellipse(center.x, center.y, radius.x, radius.y, rotation, startRadian, endRadian)
      ctx.ellipse(
        center.x,
        center.y,
        radius.x * innerRate,
        radius.y * innerRate,
        rotation,
        endRadian,
        startRadian,
        true
      )
    } else {
      ctx.ellipse(center.x, center.y, radius.x, radius.y, rotation, startRadian, endRadian)
      ctx.moveTo(center.x + radius.x * (1 + innerRate), center.y + radius.y)
      ctx.ellipse(
        center.x,
        center.y,
        radius.x * innerRate,
        radius.y * innerRate,
        rotation,
        startRadian,
        endRadian,
        true
      )
    }
  }

  ctx.closePath()
}
