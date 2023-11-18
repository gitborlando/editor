import { IXY, radianfy } from '~/editor/utils'

export function drawEllipsePath(
  center: IXY,
  radius: IXY,
  rotation: number,
  startRadian: number,
  endRadian: number,
  innerRate: number
) {
  const path = new Path2D()

  if (innerRate === 0) {
    if (endRadian !== radianfy(360)) {
      path.ellipse(center.x, center.y, radius.x, radius.y, rotation, startRadian, endRadian)
      path.lineTo(center.x, center.y)
    } else {
      path.ellipse(center.x, center.y, radius.x, radius.y, rotation, startRadian, endRadian)
    }
  } else {
    if (endRadian !== radianfy(360)) {
      path.ellipse(center.x, center.y, radius.x, radius.y, rotation, startRadian, endRadian)
      path.ellipse(
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
      path.ellipse(center.x, center.y, radius.x, radius.y, rotation, startRadian, endRadian)
      path.moveTo(center.x + radius.x * (1 + innerRate), center.y + radius.y)
      path.ellipse(
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
  path.closePath()

  return path
}
