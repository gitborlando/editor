import { injectable } from 'tsyringe'
import { xy_new } from '~/editor/math/xy'
import { OperateGeometryService, injectOperateGeometry } from '~/editor/operate/geometry'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { SchemaPageService, injectSchemaPage } from '~/editor/schema/page'
import { DragService, injectDrag } from '~/global/drag'
import { SettingService, injectSetting } from '~/global/setting'
import { Hook, autobind } from '~/shared/decorator'
import { watchNext } from '~/shared/mobx'
import { XY } from '~/shared/structure/xy'
import { StageCursorService, injectStageCursor } from '../cursor'
import { StageDrawPathService, injectStageDrawPath } from '../draw/path'
import { StageElementService, injectStageElement } from '../element'
import { StageCreateService, injectStageCreate } from '../interact/create'
import { StageSelectService, injectStageSelect } from '../interact/select'
import { StageTransformService, injectStageTransform } from '../interact/transform'
import { PIXI, PixiService, injectPixi } from '../pixi'
import { StageViewportService, injectStageViewport } from '../viewport'

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
  transformContainer = new PIXI.Container()
  private renderType = <'reDraw' | 'clear' | 'reserve'>'reserve'
  constructor(
    @injectPixi private Pixi: PixiService,
    @injectDrag private Drag: DragService,
    @injectStageViewport private StageViewport: StageViewportService,
    @injectSetting private Setting: SettingService,
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectOperateGeometry private OperateGeometry: OperateGeometryService,
    @injectStageDrawPath private StageDrawPath: StageDrawPathService,
    @injectStageTransform private StageTransform: StageTransformService,
    @injectStageElement private StageElement: StageElementService,
    @injectStageSelect private StageSelect: StageSelectService,
    @injectSchemaPage private SchemaPage: SchemaPageService,
    @injectStageCursor private StageCursor: StageCursorService,
    @injectStageCreate private StageCreate: StageCreateService
  ) {
    this.initialize()
  }
  @Hook('SchemaPage.isPageFirstRendered')
  private initialize() {
    if (this.SchemaPage.isPageFirstRendered.args[0] === false) return
    this.addToStage()
    this.hookRender()
    this.bindEvent()
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
  private get outlines() {
    return this.StageElement.outlineCache.cache.values()
  }
  private get components() {
    return [...this.lines, ...this.outlines, ...this.vertexes]
  }
  private addToStage() {
    this.components.forEach((i) => i.setParent(this.transformContainer))
    this.transformContainer.zIndex = 990
    this.transformContainer.setParent(this.Pixi.stage)
  }
  private hookRender() {
    this.Pixi.duringTicker.hook(() => {
      // this.draw()
      if (this.renderType === 'reDraw') this.draw()
      if (this.renderType === 'clear') this.clear()
    })
    this.StageCreate.duringCreate.hook(() => (this.renderType = 'reDraw'))
    this.OperateGeometry.beforeOperate.hook(() => (this.renderType = 'clear'))
    this.OperateGeometry.afterOperate.hook(() => (this.renderType = 'reDraw'))
    watchNext('SchemaNode.selectIds').hook(() => (this.renderType = 'reDraw'))
    this.StageViewport.beforeZoom.hook(() => (this.renderType = 'clear'))
    this.StageViewport.afterZoom.hook(() => (this.renderType = 'reDraw'))
  }
  private bindEvent() {
    this.bindMoveEvent()
    this.bindTopLineEvent()
    this.bindRightLineEvent()
    this.bindBottomLineEvent()
    this.bindLeftLineEvent()
  }
  private draw() {
    if (this.SchemaNode.selectIds.size === 0) return this.clear()
    this.clear()
    this.calcVertexXY()
    this.drawVertexes()
    this.drawLine()
    this.drawOutline()
    this.renderType = 'reserve'
  }
  private clear() {
    this.components.forEach((i) => i.clear())
    this.renderType = 'reserve'
  }
  private calcVertexXY() {
    const { centerX, centerY, width, height, rotation } = this.StageTransform.data
    const pivotX = centerX - width / 2
    const pivotY = centerY - height / 2
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
      const node = this.SchemaNode.find(id)
      const outline = this.StageElement.outlineCache.get(id)
      if (node.type === 'vector') {
        outline.lineStyle(0.5 / this.StageViewport.zoom, this.Setting.color)
        this.StageDrawPath.drawPath(this.StageDrawPath.getCachedPath(id), outline)
      }
    })
  }
  private bindMoveEvent() {
    const handleDrag = () => {
      if (!this.SchemaNode.hoverId) return
      if (!this.SchemaNode.selectIds.has(this.SchemaNode.hoverId)) return
      const { x, y } = this.OperateGeometry.data
      this.Drag.onStart(() => (this.renderType = 'clear'))
        .onMove(({ shift }) => {
          const realShift = this.StageViewport.toRealStageShift(shift)
          this.OperateGeometry.data.x = x + realShift.x
          this.OperateGeometry.data.y = y + realShift.y
        })
        .onEnd(({ dragService }) => {
          this.OperateGeometry.afterOperate.dispatch()
          this.renderType = 'reDraw'
          dragService.destroy()
        })
    }
    this.Pixi.addListener('mousedown', handleDrag)
  }
  private bindTopLineEvent() {
    this.lineT.eventMode = 'dynamic'
    this.lineT.hitArea = {
      contains: (x, y) =>
        new PIXI.Polygon([
          xy_new(this.vertexTL_XY.x + 5, this.vertexTL_XY.y - 5),
          xy_new(this.vertexTL_XY.x + 5, this.vertexTL_XY.y + 5),
          xy_new(this.vertexTR_XY.x - 5, this.vertexTR_XY.y + 5),
          xy_new(this.vertexTR_XY.x - 5, this.vertexTR_XY.y - 5),
        ]).contains(x, y),
    }
    this.lineT.on('mouseenter', () => this.StageCursor.setType('v-resize'))
    this.lineT.on('mouseleave', () => this.StageCursor.setType('select'))
    this.lineT.on('mousedown', () => {
      this.Pixi.isForbidEvent = true
      const { y, height } = this.OperateGeometry.data
      this.Drag.onStart(() => this.OperateGeometry.beforeOperate.dispatch(['height']))
        .onMove(({ shift }) => {
          const realShift = this.StageViewport.toRealStageShift(shift)
          this.OperateGeometry.data.height = height - realShift.y
          this.OperateGeometry.data.y = y + realShift.y
        })
        .onEnd(({ dragService }) => {
          this.Pixi.isForbidEvent = false
          this.OperateGeometry.afterOperate.dispatch()
          dragService.destroy()
        })
    })
  }
  private bindRightLineEvent() {
    this.lineR.eventMode = 'dynamic'
    this.lineR.hitArea = {
      contains: (x, y) =>
        new PIXI.Polygon([
          xy_new(this.vertexTR_XY.x - 5, this.vertexTR_XY.y + 5),
          xy_new(this.vertexTR_XY.x + 5, this.vertexTR_XY.y + 5),
          xy_new(this.vertexBR_XY.x + 5, this.vertexBR_XY.y - 5),
          xy_new(this.vertexBR_XY.x - 5, this.vertexBR_XY.y - 5),
        ]).contains(x, y),
    }
    this.lineR.on('mouseenter', () => this.StageCursor.setType('h-resize'))
    this.lineR.on('mouseleave', () => this.StageCursor.setType('select'))
    this.lineR.on('mousedown', () => {
      this.Pixi.isForbidEvent = true
      const { width } = this.OperateGeometry.data
      this.Drag.onStart(() => this.OperateGeometry.beforeOperate.dispatch(['width']))
        .onMove(({ shift }) => {
          const realShift = this.StageViewport.toRealStageShift(shift)
          this.OperateGeometry.data.width = width + realShift.x
        })
        .onEnd(({ dragService }) => {
          this.Pixi.isForbidEvent = false
          this.OperateGeometry.afterOperate.dispatch()
          dragService.destroy()
        })
    })
  }
  private bindBottomLineEvent() {
    this.lineB.eventMode = 'dynamic'
    this.lineB.hitArea = {
      contains: (x, y) =>
        new PIXI.Polygon([
          xy_new(this.vertexBL_XY.x + 5, this.vertexBL_XY.y - 5),
          xy_new(this.vertexBR_XY.x - 5, this.vertexBR_XY.y - 5),
          xy_new(this.vertexBR_XY.x - 5, this.vertexBR_XY.y + 5),
          xy_new(this.vertexBL_XY.x + 5, this.vertexBL_XY.y + 5),
        ]).contains(x, y),
    }
    this.lineB.on('mouseenter', () => this.StageCursor.setType('v-resize'))
    this.lineB.on('mouseleave', () => this.StageCursor.setType('select'))
    this.lineB.on('mousedown', () => {
      this.Pixi.isForbidEvent = true
      const { height } = this.OperateGeometry.data
      this.Drag.onStart(() => this.OperateGeometry.beforeOperate.dispatch(['height']))
        .onMove(({ shift }) => {
          const realShift = this.StageViewport.toRealStageShift(shift)
          this.OperateGeometry.data.height = height + realShift.y
        })
        .onEnd(({ dragService }) => {
          this.Pixi.isForbidEvent = false
          this.OperateGeometry.afterOperate.dispatch()
          dragService.destroy()
        })
    })
  }
  private bindLeftLineEvent() {
    this.lineL.eventMode = 'dynamic'
    this.lineL.hitArea = {
      contains: (x, y) =>
        new PIXI.Polygon([
          xy_new(this.vertexTL_XY.x - 5, this.vertexTL_XY.y + 5),
          xy_new(this.vertexTL_XY.x + 5, this.vertexTL_XY.y + 5),
          xy_new(this.vertexBL_XY.x + 5, this.vertexBL_XY.y - 5),
          xy_new(this.vertexBL_XY.x - 5, this.vertexBL_XY.y - 5),
        ]).contains(x, y),
    }
    this.lineL.on('mouseenter', () => this.StageCursor.setType('h-resize'))
    this.lineL.on('mouseleave', () => this.StageCursor.setType('select'))
    this.lineL.on('mousedown', () => {
      this.Pixi.isForbidEvent = true
      const { x, width } = this.OperateGeometry.data
      this.Drag.onStart(() => this.OperateGeometry.beforeOperate.dispatch(['width']))
        .onMove(({ shift }) => {
          const realShift = this.StageViewport.toRealStageShift(shift)
          this.OperateGeometry.data.width = width - realShift.x
          this.OperateGeometry.data.x = x + realShift.x
        })
        .onEnd(({ dragService }) => {
          this.Pixi.isForbidEvent = false
          this.OperateGeometry.afterOperate.dispatch()
          dragService.destroy()
        })
    })
  }
}
