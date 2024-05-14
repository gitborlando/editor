import { IIrregular, IPoint } from '~/editor/schema/type'
import { loopFor } from './list'
import { IXY } from './normal'

export class IrregularUtils {
  static shiftPointX(point: IPoint, x: number) {
    point.x += x
    if (point.handleLeft) point.handleLeft.x += x
    if (point.handleRight) point.handleRight.x += x
  }
  static shiftPointY(point: IPoint, y: number) {
    point.y += y
    if (point.handleLeft) point.handleLeft.y += y
    if (point.handleRight) point.handleRight.y += y
  }
  static shiftPointXY(point: IPoint, xy: IXY) {
    this.shiftPointX(point, xy.x)
    this.shiftPointY(point, xy.y)
  }

  static multiPointX(point: IPoint, x: number) {
    point.x *= x
    if (point.handleLeft) point.handleLeft.x *= x
    if (point.handleRight) point.handleRight.x *= x
  }
  static multiPointY(point: IPoint, y: number) {
    point.y *= y
    if (point.handleLeft) point.handleLeft.y *= y
    if (point.handleRight) point.handleRight.y *= y
  }
  static multiPointXY(point: IPoint, xy: IXY) {
    this.multiPointX(point, xy.x)
    this.multiPointY(point, xy.y)
  }

  static getNodeSvgPath(node: IIrregular) {
    let path = ''
    loopFor(node.points, (cur, next, last, i) => {
      if (i === node.points.length - 1 && cur.endPath) return (path += 'Z ')
      if (cur.startPath) path += `M${cur.x},${cur.y} `
      if (next.startPath) return
      if (cur.handleRight && next.handleLeft) {
        const [cp2, cp1] = [next.handleLeft, cur.handleRight]
        path += `C${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${next.x},${next.y} `
      } else if (cur.handleRight) {
        path += `Q${cur.handleRight.x},${cur.handleRight.y} ${next.x},${next.y} `
      } else if (next.handleLeft) {
        path += `Q${next.handleLeft.x},${next.handleLeft.y} ${cur.x},${cur.y} `
      } else {
        path += `L${next.x},${next.y} `
      }
    })
    return path
  }
}
