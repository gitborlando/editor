import { IXY } from '@gitborlando/geo'
import { nearestPixel } from 'src/editor/math/base'
import { Surface } from 'src/editor/stage/render/surface'
import { StageViewport } from 'src/editor/stage/viewport'

class StageToolGridService {
  private ctx!: CanvasRenderingContext2D

  init() {
    Surface.inited$.hook(() => {
      autorun(() => {
        // this.draw()
      })
    })
  }

  draw() {
    Surface.ctxSaveRestore((ctx) => {
      Surface.transformMatrix()
      this.ctx = ctx
      ctx.strokeStyle = COLOR.gray
      ctx.lineWidth = 0.6
      this.getTicks().forEach(({ x, y, length }) => {
        this.drawLine('horizontal', { x, y }, length)
        this.drawLine('vertical', { x, y }, length)
      })
    })
  }

  drawLine(type: 'horizontal' | 'vertical', start: IXY, length: number) {
    const path2d = new Path2D()
    path2d.moveTo(nearestPixel(start.x), nearestPixel(start.y))
    if (type === 'horizontal') {
      path2d.lineTo(nearestPixel(start.x + length), nearestPixel(start.y))
    } else {
      path2d.lineTo(nearestPixel(start.x), nearestPixel(start.y + length))
    }
    this.ctx.stroke(path2d)
  }

  getTicks = () => {
    const { bound, zoom } = StageViewport

    const ticks: { x: number; y: number; length: number }[] = []
    const offset = XY.from(StageViewport.offset).divide(zoom)
    const sceneWidth = bound.width / zoom
    const sceneHeight = bound.height / zoom
    const step = getStepByZoom(zoom)
    const hStart = getNearestIntMultiple(-offset.x, step)
    const hEnd = getNearestIntMultiple(sceneWidth - offset.x, step)
    const vStart = getNearestIntMultiple(-offset.y, step)
    const vEnd = getNearestIntMultiple(sceneHeight - offset.y, step)
    for (let i = hStart - step; i <= hEnd + step; i += step) {
      ticks.push({ x: i, y: vStart, length: sceneHeight })
    }
    for (let i = vStart - step; i <= vEnd + step; i += step) {
      ticks.push({ x: hStart, y: i, length: sceneWidth })
    }
    return ticks
  }
}

export const StageToolGrid = autoBind(makeObservable(new StageToolGridService()))

const getStepByZoom = (zoom: number) => {
  const steps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]
  const base = 50 / zoom
  return steps.find((i) => i >= base) || steps[0]
}

const getNearestIntMultiple = (number: number, rate: number = 1) => {
  const n = (number / rate) | 0
  const left = rate * n
  const right = rate * (n + 1)
  return number - left <= right - number ? left : right
}
