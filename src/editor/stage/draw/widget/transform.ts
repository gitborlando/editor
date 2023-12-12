import { inject, injectable } from 'tsyringe'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { DragService, injectDrag } from '~/editor/utility/drag'
import { SettingService, injectSetting } from '~/global/setting'
import { Watch, When, autobind } from '~/shared/decorator'
import { XY } from '~/shared/structure/xy'
import { StageTransformService, injectStageTransform } from '../../interact/transform'
import { PIXI, PixiService, injectPixi } from '../../pixi'
import { StageViewportService, injectStageViewport } from '../../viewport'

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
  constructor(
    @injectPixi private Pixi: PixiService,
    @injectDrag private Drag: DragService,
    @injectStageViewport private StageViewport: StageViewportService,
    @injectSetting private Setting: SettingService,
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectStageTransform private StageTransform: StageTransformService
  ) {
    this.SchemaNode.onFlushDirty((id) => {
      id === this.StageTransform.id && this.draw()
    })
  }
  get vertexes() {
    return [this.vertexTL, this.vertexTR, this.vertexBL, this.vertexBR]
  }
  get vertexXYs() {
    return [this.vertexTL_XY, this.vertexTR_XY, this.vertexBL_XY, this.vertexBR_XY]
  }
  get lines() {
    return [this.lineL, this.lineT, this.lineR, this.lineB]
  }
  @When('StageViewport.initialized')
  @Watch('StageViewport.zoom')
  private draw() {
    if (!this.SchemaNode.selectIds.size) return this.clear()
    this.clear()
    this.addToStage()
    this.calcVertexXY()
    this.drawVertexes()
    this.drawLine()
  }
  private clear() {
    ;[...this.lines, ...this.vertexes].forEach((i) => i.clear())
  }
  private addToStage() {
    ;[...this.lines, ...this.vertexes].forEach((i) => i.setParent(this.Pixi.stage))
  }
  private calcVertexXY() {
    const { pivotX, pivotY, centerX, centerY, width, height, rotation } =
      this.StageTransform.transformNode
    this.vertexTL_XY = XY.Of(pivotX, pivotY).rotate(XY.Of(centerX, centerY), rotation)
    this.vertexTR_XY = XY.Of(pivotX + width, pivotY).rotate(XY.Of(centerX, centerY), rotation)
    this.vertexBL_XY = XY.Of(pivotX, pivotY + height).rotate(XY.Of(centerX, centerY), rotation)
    this.vertexBR_XY = XY.Of(pivotX + width, pivotY + height).rotate(
      XY.Of(centerX, centerY),
      rotation
    )
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
}

export const injectStageWidgetTransform = inject(StageWidgetTransformService)

// const startXY = XY.From(this.transformerWidget)
//     // this.Drag.onSlide(({ shift }) => {
//     //   const realShift = this.StageViewport.toRealStageShift(shift)
//     //   // node.x = startXY.x + realShift.x
//     //   // node.y = startXY.y + realShift.y
//     // })
