import { inject, injectable } from 'tsyringe'
import { radianfy } from '~/editor/math/base'
import { Watch, When, autobind } from '~/shared/decorator'
import { PIXI, PixiService, injectPixi } from '../pixi'
import { StageViewportService, injectStageViewport } from '../viewport'

@autobind
@injectable()
export class StageWidgetRulerService {
  private vertical = new PIXI.Graphics()
  private horizontal = new PIXI.Graphics()
  private corner = new PIXI.Graphics()
  private container = new PIXI.Container()
  private labels = <PIXI.Text[]>[]
  private baseX = 0
  private baseY = 0
  constructor(
    @injectPixi private Pixi: PixiService,
    @injectStageViewport private StageViewport: StageViewportService
  ) {
    this.initialize()
  }
  get zoom() {
    return this.StageViewport.zoom
  }
  @When('StageViewport.initialized')
  private initialize() {
    this.baseX = this.StageViewport.stageOffset.x / this.zoom
    this.baseY = this.StageViewport.stageOffset.y / this.zoom
    this.horizontal.setParent(this.container)
    this.vertical.setParent(this.container)
    this.corner.setParent(this.container)
    this.container.setParent(this.Pixi.app.stage)
    this.autoDraw()
    this.drawCorner()
  }
  @Watch('zoom', 'StageViewport.stageOffset')
  private autoDraw() {
    this.horizontal.clear()
    this.vertical.clear()
    while (this.labels.length) this.labels.pop()?.destroy()
    this.drawHorizontal()
    this.drawVertical()
  }
  private drawHorizontal() {
    const width = this.StageViewport.bound.width / this.zoom
    const offsetX = this.StageViewport.stageOffset.x / this.zoom
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
    const height = this.StageViewport.bound.height / this.zoom
    const offsetY = this.StageViewport.stageOffset.y / this.zoom
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
    const base = 50 / this.StageViewport.zoom
    return steps.find((i) => i >= base) || steps[0]
  }
  private getNearestIntMultiple = (number: number, rate: number) => {
    const n = Math.floor(number / rate)
    const left = rate * n
    const right = rate * (n + 1)
    return number - left <= right - number ? left : right
  }
}

export const injectStageWidgetRuler = inject(StageWidgetRulerService)
