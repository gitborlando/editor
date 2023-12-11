import { radianfy } from '~/editor/math/base'
import { IXY } from '~/shared/utils'

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

// ellipse() {
//   const item = new Konva.Shape({
//     sceneFunc: (ctx, shape) => {
//       const { x, y, width, height, rotation } = this.getShapeBaseAttr(shape)
//       const innerRate = (shape.getAttr('innerRate') || 0) as number
//       const startRadian = radianfy((shape.getAttr('startAngle') || 0) as number)
//       const endRadian = radianfy((shape.getAttr('endAngle') || 360) as number)
//       const center = { x: x + width / 2, y: y + height / 2 }
//       const radius = { x: width / 2, y: height / 2 }
//       const path = drawEllipsePath(center, radius, rotation, startRadian, endRadian, innerRate)
//       const fill = shape.getAttr('fill')
//       ctx.fillStyle = fill
//       ctx.fill(path)
//     },
//   })
//   //  / this.stage.mainLayer.add(item)
//   return item
// }

// private getShapeBaseAttr(shape: Shape<ShapeConfig>) {
//   const x = (shape.getAttr('x') || 0) as number
//   const y = (shape.getAttr('y') || 0) as number
//   const width = (shape.getAttr('width') || 0) as number
//   const height = (shape.getAttr('height') || 0) as number
//   const rotation = (shape.getAttr('rotation') || 0) as number
//   return { x, y, width, height, rotation }
// }
