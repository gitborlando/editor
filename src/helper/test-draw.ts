import { IXY } from '~/editor/utility/utils'

export type IPoint = {
  type: 'point'
  mode: 'no-bezier' | 'symmetric' | 'angle-symmetric' | 'no-symmetric'
  x: number
  y: number
  handleIn: IXY
  handleOut: IXY
  radius: number
}

export function testDraw(ctx: CanvasRenderingContext2D) {
  let closed = false
  const p1 = [0, 0, 1]
  const p2 = [100, 0, 1]
  const p3 = [100, 100, 1]
  const p4 = [0, 100, 1]
  ctx.translate(100, 100)
  ctx.beginPath()

  const start = closed ? [(p1[0] + p4[0]) / 2, (p1[1] + p4[1]) / 2] : [p1[0], p1[1]]
  ;[p1, p2, p3, p4, p1].forEach(([x, y, t], i, arr) => {
    if (i === 0) ctx.moveTo(start[0], start[1])
    const [lx, ly, lt] = arr[i <= 0 ? arr.length - 1 : i - 1]
    const [rx, ry, rt] = arr[i >= arr.length - 1 ? 0 : i + 1]

    if (i === arr.length - 1) {
      ctx.closePath()
    } else ctx.arcTo(x, y, rx, ry, t === 1 ? 20 : 0)
  })
  // ctx.moveTo(p1[0], p1[1])
  // ctx.lineTo(p2[0], p2[1])
  // ctx.lineTo(p3[0], p3[1])
  // ctx.lineTo(p4[0], p4[1])
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'
  ctx.lineWidth = 1
  ctx.stroke()
}
