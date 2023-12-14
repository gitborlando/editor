import { inject, injectable } from 'tsyringe'
import { OperateGeometryService, injectOperateGeometry } from '~/editor/operate/geometry'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { DragService, injectDrag } from '~/global/drag'
import { SettingService, injectSetting } from '~/global/setting'
import { Hook, autobind } from '~/shared/decorator'
import { XY } from '~/shared/structure/xy'
import { PIXI, PixiService, injectPixi } from '../../pixi'
import { StageViewportService, injectStageViewport } from '../../viewport'
import { StageDrawService, injectStageDraw } from '../draw'

@autobind
@injectable()
export class StageWidgetTransformService {
  vertexTL_XY = XY.Of(0, 0)
  vertexTR_XY = XY.Of(0, 0)
  vertexBL_XY = XY.Of(0, 0)
  vertexBR_XY = XY.Of(0, 0)
  vertexTL = new PIXI.Graphics()
  vertexTR = new PIXI.Graphics()
  vertexBL = new PIXI.Graphics()
  vertexBR = new PIXI.Graphics()
  lineL = new PIXI.Graphics()
  lineT = new PIXI.Graphics()
  lineR = new PIXI.Graphics()
  lineB = new PIXI.Graphics()
  outlines = <PIXI.Graphics[]>[]
  private renderType = <'reDraw' | 'clear' | 'reserve'>'reserve'
  constructor(
    @injectPixi private Pixi: PixiService,
    @injectDrag private Drag: DragService,
    @injectStageViewport private StageViewport: StageViewportService,
    @injectSetting private Setting: SettingService,
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectOperateGeometry private OperateGeometry: OperateGeometryService,
    @injectStageDraw private StageDraw: StageDrawService
  ) {
    this.initialize()
  }
  @Hook('Pixi.afterInitialize', 2)
  private initialize() {
    this.Pixi.duringTicker.hook(() => {
      if (this.renderType === 'reDraw') this.draw()
      if (this.renderType === 'clear') this.clear()
    })
    this.OperateGeometry.beforeOperate.hook(() => (this.renderType = 'clear'))
    this.OperateGeometry.afterOperate.hook(() => (this.renderType = 'reDraw'))
    this.SchemaNode.whenSelectChange.hook(() => (this.renderType = 'reDraw'))
    this.StageViewport.whenZoomChange.hook(() => (this.renderType = 'reDraw'))
  }
  private get vertexes() {
    return [this.vertexTL, this.vertexTR, this.vertexBL, this.vertexBR]
  }
  private get vertexXYs() {
    return [this.vertexTL_XY, this.vertexTR_XY, this.vertexBL_XY, this.vertexBR_XY]
  }
  private get lines() {
    return [this.lineL, this.lineT, this.lineR, this.lineB]
  }
  private draw() {
    if (this.SchemaNode.selectCount === 0) {
      return this.clear()
    }
    this.clear()
    this.calcVertexXY()
    this.drawVertexes()
    this.drawLine()
    this.drawOutline()
    this.addToStage()
    this.renderType = 'reserve'
  }
  private clear() {
    ;[...this.lines, ...this.outlines, ...this.vertexes].forEach((i) => i.clear())
    this.outlines = []
    this.renderType = 'reserve'
  }
  private addToStage() {
    ;[...this.lines, ...this.outlines, ...this.vertexes].forEach((i) =>
      i.setParent(this.Pixi.stage)
    )
  }
  private calcVertexXY() {
    const { centerX, centerY, width, height, rotation } = this.OperateGeometry.proxyData
    const { x: pivotX, y: pivotY } = this.OperateGeometry.pivotXY
    const centerXY = XY.Of(centerX, centerY)
    this.vertexTL_XY = XY.Of(pivotX, pivotY).rotate(centerXY, rotation)
    this.vertexTR_XY = XY.Of(pivotX + width, pivotY).rotate(centerXY, rotation)
    this.vertexBL_XY = XY.Of(pivotX, pivotY + height).rotate(centerXY, rotation)
    this.vertexBR_XY = XY.Of(pivotX + width, pivotY + height).rotate(centerXY, rotation)
  }
  private drawVertexes() {
    const size = 6 / this.StageViewport.zoom
    const borderWidth = 1 / this.StageViewport.zoom
    const radius = 1 / this.StageViewport.zoom
    this.vertexes.forEach((vertex, i) => {
      vertex.lineStyle(borderWidth, this.Setting.color)
      vertex.beginFill('white')
      vertex.drawRoundedRect(
        this.vertexXYs[i].x - size / 2,
        this.vertexXYs[i].y - size / 2,
        size,
        size,
        radius
      )
    })
  }
  private drawLine() {
    const lineWidth = 1 / this.StageViewport.zoom
    this.lines.forEach((line) => {
      line.lineStyle(lineWidth, this.Setting.color)
    })
    this.lineT.moveTo(this.vertexTL_XY.x, this.vertexTL_XY.y)
    this.lineT.lineTo(this.vertexTR_XY.x, this.vertexTR_XY.y)
    this.lineR.moveTo(this.vertexTR_XY.x, this.vertexTR_XY.y)
    this.lineR.lineTo(this.vertexBR_XY.x, this.vertexBR_XY.y)
    this.lineB.moveTo(this.vertexBL_XY.x, this.vertexBL_XY.y)
    this.lineB.lineTo(this.vertexBR_XY.x, this.vertexBR_XY.y)
    this.lineL.moveTo(this.vertexTL_XY.x, this.vertexTL_XY.y)
    this.lineL.lineTo(this.vertexBL_XY.x, this.vertexBL_XY.y)
  }
  private drawOutline() {
    this.SchemaNode.selectIds.forEach((id) => {
      const outline = new PIXI.Graphics()
      this.outlines.push(outline)
      const node = this.SchemaNode.find(id)
      if (node.type === 'vector') {
        outline.lineStyle(0.5 / this.StageViewport.zoom, this.Setting.color)
        this.StageDraw.drawPath(outline, node)
      }
    })
  }
}

export const injectStageWidgetTransform = inject(StageWidgetTransformService)

// const startXY = XY.From(this.transformerWidget)
//     // this.Drag.onSlide(({ shift }) => {
//     //   const realShift = this.StageViewport.toRealStageShift(shift)
//     //   // node.x = startXY.x + realShift.x
//     //   // node.y = startXY.y + realShift.y
//     // })
