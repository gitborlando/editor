import autobind from 'class-autobind-decorator'
import { radianfy } from '~/editor/math/base'
import { OperateNode } from '~/editor/operate/node'
import { PIXI, Pixi } from '../pixi'
import { StageViewport } from '../viewport'

@autobind
class StageWidgetRulerService {
  private vertical = new PIXI.Graphics()
  private horizontal = new PIXI.Graphics()
  private corner = new PIXI.Graphics()
  private container = new PIXI.Container()
  private labels = <PIXI.Text[]>[]
  get zoom() {
    return StageViewport.zoom.value
  }
  initHook() {
    Pixi.inited.hook(() => {
      this.horizontal.setParent(this.container)
      this.vertical.setParent(this.container)
      this.corner.setParent(this.container)
      this.container.setParent(Pixi.app.stage)
      this.autoDraw()
      this.drawCorner()
    })
    OperateNode.datumId.hook(this.autoDraw)
    StageViewport.zoom.hook(this.autoDraw)
    StageViewport.stageOffset.hook(this.autoDraw)
  }
  private autoDraw() {
    this.horizontal.clear()
    this.vertical.clear()
    while (this.labels.length) this.labels.pop()?.destroy()
    this.drawHorizontal()
    this.drawVertical()
  }
  private drawHorizontal() {
    const width = StageViewport.bound.value.width / this.zoom
    const offsetX = (StageViewport.stageOffset.value.x + OperateNode.datumXY.x) / this.zoom
    // this.horizontal.beginFill('#F5F5F5')
    // this.horizontal.drawRect(0, 0, width, 20)
    const step = this.getStepByZoom()
    const start = this.getNearestIntMultiple(-offsetX, step)
    const end = this.getNearestIntMultiple(width - offsetX, step)
    let i = start
    this.horizontal.lineStyle(0.5, '#9F9F9F')
    while (i <= end) {
      const x = (i + offsetX) * this.zoom
      this.horizontal.moveTo(x, 0)
      this.horizontal.lineTo(x, 4)
      const label = new PIXI.Text(i, { fontSize: 10, fill: '#9F9F9F' })
      this.labels.push(label)
      this.horizontal.addChild(label)
      label.x = x - label.getBounds().width / 2
      label.y = 6
      i += step
    }
  }
  private drawVertical() {
    const height = StageViewport.bound.value.height / this.zoom
    const offsetY = (StageViewport.stageOffset.value.y + OperateNode.datumXY.y) / this.zoom
    // this.vertical.beginFill('#F5F5F5')
    // this.vertical.drawRect(0, 0, 20, height)
    const step = this.getStepByZoom()
    const start = this.getNearestIntMultiple(-offsetY, step)
    const end = this.getNearestIntMultiple(height - offsetY, step)
    let i = start
    this.vertical.lineStyle(0.5, '#9F9F9F')
    while (i <= end) {
      const y = (i + offsetY) * this.zoom
      this.vertical.moveTo(0, y)
      this.vertical.lineTo(4, y)
      const label = new PIXI.Text(i, { fontSize: 10, fill: '#9F9F9F' })
      this.labels.push(label)
      this.vertical.addChild(label)
      label.x = 6
      label.y = y + label.getBounds().width / 2
      label.rotation = radianfy(-90)
      i += step
    }
  }
  private drawCorner() {
    this.corner.beginFill('#F5F5F5')
    this.corner.drawRect(0, 0, 20, 20)
  }
  private getStepByZoom = () => {
    const steps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]
    const base = 50 / StageViewport.zoom.value
    return steps.find((i) => i >= base) || steps[0]
  }
  private getNearestIntMultiple = (number: number, rate: number) => {
    const n = Math.floor(number / rate)
    const left = rate * n
    const right = rate * (n + 1)
    return number - left <= right - number ? left : right
  }
}

export const StageWidgetRuler = new StageWidgetRulerService()
