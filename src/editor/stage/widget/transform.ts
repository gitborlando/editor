import { xy_new } from '~/editor/math/xy'
import { OperateGeometry } from '~/editor/operate/geometry'
import { SchemaNode } from '~/editor/schema/node'
import { Drag } from '~/global/event/drag'
import { Setting } from '~/global/setting'
import { autobind } from '~/shared/decorator'
import { XY } from '~/shared/structure/xy'
import { firstOne } from '~/shared/utils/array'
import { StageCursor } from '../cursor'
import { StageDraw } from '../draw/draw'
import { StageCreate } from '../interact/create'
import { StageSelect } from '../interact/select'
import { StageTransform } from '../interact/transform'
import { PIXI, Pixi } from '../pixi'
import { StageViewport } from '../viewport'

@autobind
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
  transformContainer = new PIXI.Container()
  private renderType = <'reDraw' | 'clear' | 'reserve'>'reserve'
  initHook() {
    Pixi.inited.hook(() => {
      this.addToStage()
      this.bindEvent()
    })
    this.hookRender()
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
  private get components() {
    return [...this.lines, ...this.outlines, ...this.vertexes]
  }
  private addToStage() {
    this.components.forEach((i) => i.setParent(this.transformContainer))
    this.transformContainer.zIndex = 990
    this.transformContainer.setParent(Pixi.sceneStage)
  }
  private hookRender() {
    Pixi.duringTicker.hook(() => {
      this.draw()
      // if (this.renderType === 'reDraw') this.draw()
      // if (this.renderType === 'clear') this.clear()
    })
    StageCreate.duringCreate.hook(() => (this.renderType = 'reDraw'))
    OperateGeometry.beforeOperate.hook(() => (this.renderType = 'clear'))
    OperateGeometry.afterOperate.hook(() => (this.renderType = 'reDraw'))
    StageSelect.afterSelect.hook(() => (this.renderType = 'reDraw'))
    StageViewport.beforeZoom.hook(() => (this.renderType = 'clear'))
    StageViewport.afterZoom.hook(() => (this.renderType = 'reDraw'))
    SchemaNode.selectIds.hook(() => (this.renderType = 'reDraw'))
  }
  private bindEvent() {
    this.bindMoveEvent()
    this.bindTopLineEvent()
    this.bindRightLineEvent()
    this.bindBottomLineEvent()
    this.bindLeftLineEvent()
  }
  private draw() {
    if (SchemaNode.selectIds.value.size === 0) return this.clear()
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
    const { centerX, centerY, /* pivotX, pivotY, */ width, height, rotation } = StageTransform.data
    const pivotX = centerX - width / 2
    const pivotY = centerY - height / 2
    const centerXY = XY.Of(centerX, centerY)
    this.vertexTL_XY = XY.Of(pivotX, pivotY).rotate(centerXY, rotation)
    this.vertexTR_XY = XY.Of(pivotX + width, pivotY).rotate(centerXY, rotation)
    this.vertexBL_XY = XY.Of(pivotX, pivotY + height).rotate(centerXY, rotation)
    this.vertexBR_XY = XY.Of(pivotX + width, pivotY + height).rotate(centerXY, rotation)
  }
  private drawVertexes() {
    const size = 6 / StageViewport.zoom.value
    const borderWidth = 1 / StageViewport.zoom.value
    const radius = 1 / StageViewport.zoom.value
    this.vertexes.forEach((vertex, i) => {
      vertex.lineStyle(borderWidth, Setting.color.value)
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
    const lineWidth = 1 / StageViewport.zoom.value
    this.lines.forEach((line) => {
      line.lineStyle(lineWidth, Setting.color.value)
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
    SchemaNode.selectIds.value.forEach((id) => {
      const node = SchemaNode.find(id)
      const outline = new PIXI.Graphics()
      outline.setParent(Pixi.sceneStage)
      this.outlines.push(outline)
      if (node.type === 'vector') {
        outline.lineStyle(0.5 / StageViewport.zoom.value, Setting.color.value)
        StageDraw.drawShape(outline, node)
      }
    })
  }
  private bindMoveEvent() {
    const handleDrag = () => {
      if (!SchemaNode.hoverIds.value.size) return
      if (!SchemaNode.selectIds.value.has(firstOne(SchemaNode.hoverIds.value))) return
      const { x, y } = OperateGeometry.data
      Drag.onStart(() => (this.renderType = 'clear'))
        .onMove(({ shift }) => {
          const realShift = StageViewport.toRealStageShiftXY(shift)
          OperateGeometry.data.x = x + realShift.x
          OperateGeometry.data.y = y + realShift.y
        })
        .onDestroy(() => {
          OperateGeometry.afterOperate.dispatch()
          this.renderType = 'reDraw'
        })
    }
    Pixi.addListener('mousedown', handleDrag)
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
    this.lineT.on('mouseenter', () => StageCursor.type.dispatch('v-resize'))
    this.lineT.on('mouseleave', () => StageCursor.type.dispatch('select'))
    this.lineT.on('mousedown', () => {
      Pixi.isForbidEvent = true
      const { y, height } = OperateGeometry.data
      Drag.onStart(() => OperateGeometry.beforeOperate.dispatch('height'))
        .onMove(({ shift }) => {
          const realShift = StageViewport.toRealStageShiftXY(shift)
          OperateGeometry.data.height = height - realShift.y
          OperateGeometry.data.y = y + realShift.y
        })
        .onEnd(({ dragService }) => {
          Pixi.isForbidEvent = false
          OperateGeometry.afterOperate.dispatch()
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
    this.lineR.on('mouseenter', () => StageCursor.type.dispatch('h-resize'))
    this.lineR.on('mouseleave', () => StageCursor.type.dispatch('select'))
    this.lineR.on('mousedown', () => {
      Pixi.isForbidEvent = true
      const { width } = OperateGeometry.data
      Drag.onStart(() => OperateGeometry.beforeOperate.dispatch('width'))
        .onMove(({ shift }) => {
          const realShift = StageViewport.toRealStageShiftXY(shift)
          OperateGeometry.data.width = width + realShift.x
        })
        .onEnd(({ dragService }) => {
          Pixi.isForbidEvent = false
          OperateGeometry.afterOperate.dispatch()
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
    this.lineB.on('mouseenter', () => StageCursor.type.dispatch('v-resize'))
    this.lineB.on('mouseleave', () => StageCursor.type.dispatch('select'))
    this.lineB.on('mousedown', () => {
      Pixi.isForbidEvent = true
      const { height } = OperateGeometry.data
      Drag.onStart(() => OperateGeometry.beforeOperate.dispatch('height'))
        .onMove(({ shift }) => {
          const realShift = StageViewport.toRealStageShiftXY(shift)
          OperateGeometry.data.height = height + realShift.y
        })
        .onEnd(({ dragService }) => {
          Pixi.isForbidEvent = false
          OperateGeometry.afterOperate.dispatch()
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
    this.lineL.on('mouseenter', () => StageCursor.type.dispatch('h-resize'))
    this.lineL.on('mouseleave', () => StageCursor.type.dispatch('select'))
    this.lineL.on('mousedown', () => {
      Pixi.isForbidEvent = true
      const { x, width } = OperateGeometry.data
      Drag.onStart(() => OperateGeometry.beforeOperate.dispatch('width'))
        .onMove(({ shift }) => {
          const realShift = StageViewport.toRealStageShiftXY(shift)
          OperateGeometry.data.width = width - realShift.x
          OperateGeometry.data.x = x + realShift.x
        })
        .onEnd(({ dragService }) => {
          Pixi.isForbidEvent = false
          OperateGeometry.afterOperate.dispatch()
          dragService.destroy()
        })
    })
  }
}

export const StageWidgetTransform = new StageWidgetTransformService()
