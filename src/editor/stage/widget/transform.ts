import autobind from 'class-autobind-decorator'
import { max, min } from '~/editor/math/base'
import { OBB } from '~/editor/math/obb'
import { xy_new } from '~/editor/math/xy'
import { OperateGeometry } from '~/editor/operate/geometry'
import { SchemaNode } from '~/editor/schema/node'
import { Drag } from '~/global/event/drag'
import { Setting } from '~/global/setting'
import { XY } from '~/shared/structure/xy'
import { firstOne } from '~/shared/utils/array'
import { StageCursor } from '../cursor'
import { StageDraw } from '../draw/draw'
import { StageElement } from '../element'
import { StageSelect } from '../interact/select'
import { PIXI, Pixi } from '../pixi'
import { StageViewport } from '../viewport'

@autobind
export class StageWidgetTransformService {
  transformOBB: OBB = new OBB(0, 0, 0, 0, 0)
  private renderType = <'reDraw' | 'clear'>'clear'
  private vertexTL_XY = XY.Of(0, 0)
  private vertexTR_XY = XY.Of(0, 0)
  private vertexBL_XY = XY.Of(0, 0)
  private vertexBR_XY = XY.Of(0, 0)
  private vertexTL = new PIXI.Graphics()
  private vertexTR = new PIXI.Graphics()
  private vertexBL = new PIXI.Graphics()
  private vertexBR = new PIXI.Graphics()
  private lineL = new PIXI.Graphics()
  private lineT = new PIXI.Graphics()
  private lineR = new PIXI.Graphics()
  private lineB = new PIXI.Graphics()
  private outlines = <PIXI.Graphics[]>[]
  private transformContainer = new PIXI.Container()
  initHook() {
    Pixi.inited.hook(() => {
      this.addToStage()
      this.bindEvent()
    })
    Pixi.duringTicker.hook(() => {
      if (this.renderType === 'reDraw') this.draw()
      if (this.renderType === 'clear') this.clear()
    }, ['after:flushDirty'])
    this.hookTransform()
    this.hookRender()
  }
  mouseIn(e: MouseEvent) {
    if (this.renderType === 'clear') return false
    const { x, y } = StageViewport.toSceneStageXY(XY.From(e, 'client'))
    const pointOBB = new OBB(x, y, 1, 1, 0)
    return this.transformOBB.obbHitTest(pointOBB)
  }
  private get selectIds() {
    return SchemaNode.selectIds.value
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
  private bindEvent() {
    this.bindMoveEvent()
    this.bindTopLineEvent()
    this.bindRightLineEvent()
    this.bindBottomLineEvent()
    this.bindLeftLineEvent()
  }
  private hookTransform() {
    StageSelect.duringMarqueeSelect.hook(this.calcTransformOBB)
    StageSelect.afterSelect.hook(this.calcTransformOBB)
    SchemaNode.afterFlushDirty.hook(() => {
      if (OperateGeometry.isGeometryChanged) this.calcTransformOBB()
    }, ['id:calcTransformOBB', 'before:operateGeometryReset'])
  }
  private hookRender() {
    const setClear = () => (this.renderType = 'clear')
    const setReDraw = () => (this.renderType = 'reDraw')
    OperateGeometry.beforeOperate.hook(setClear)
    StageViewport.beforeZoom.hook(setClear)
    StageSelect.afterClearSelect.hook(setClear)
    OperateGeometry.afterOperate.hook(setReDraw)
    StageViewport.afterZoom.hook(setReDraw)
    SchemaNode.selectIds.hook((selectIds) => {
      selectIds.size === 0 ? setClear() : setReDraw()
    })
  }
  private clear() {
    this.components.forEach((i) => i.clear())
  }
  private draw() {
    this.clear()
    if (this.selectIds.size === 0) return
    this.calcVertexXY()
    this.drawVertexes()
    this.drawLine()
    this.drawOutline()
  }
  private calcTransformOBB() {
    if (this.selectIds.size === 1) {
      const nodeOBB = StageElement.OBBCache.get(firstOne(this.selectIds))
      const { centerX, centerY, width, height, rotation } = nodeOBB
      this.transformOBB = new OBB(centerX, centerY, width, height, rotation)
    }
    if (this.selectIds.size > 1) {
      let [xMin, yMin, xMax, yMax] = [Infinity, Infinity, -Infinity, -Infinity]
      SchemaNode.selectNodes.forEach((node) => {
        const nodeOBB = StageElement.OBBCache.get(node.id)
        nodeOBB.vertexes.forEach((xy) => {
          xMin = min(xMin, xy.x)
          yMin = min(yMin, xy.y)
          xMax = max(xMax, xy.x)
          yMax = max(yMax, xy.y)
        })
      })
      const [x, y, width, height] = [xMin, yMin, xMax - xMin, yMax - yMin]
      this.transformOBB = new OBB(x + width / 2, y + height / 2, width, height, 0)
    }
  }
  private calcVertexXY() {
    const { centerX, centerY, width, height, rotation } = this.transformOBB!
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
      const { x, y } = OperateGeometry.data
      Drag.onStart(() => {
        this.renderType = 'clear'
        StageElement.canHover = false
        OperateGeometry.beforeOperate.dispatch(['x', 'y'])
      })
        .onMove(({ shift }) => {
          const sceneShiftXY = StageViewport.toSceneStageShiftXY(shift)
          OperateGeometry.data.x = x + sceneShiftXY.x
          OperateGeometry.data.y = y + sceneShiftXY.y
        })
        .onDestroy(() => {
          OperateGeometry.afterOperate.dispatch()
          StageElement.canHover = true
        })
    }
    Pixi.addListener('mousedown', (e) => {
      if (this.mouseIn(e as MouseEvent)) handleDrag()
    })
    StageSelect.afterSelect.hook((type) => {
      if (type === 'stage-single') handleDrag()
    })
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
      Drag.onStart(() => OperateGeometry.beforeOperate.dispatch(['height']))
        .onMove(({ shift }) => {
          const sceneShiftXY = StageViewport.toSceneStageShiftXY(shift)
          OperateGeometry.data.height = height - sceneShiftXY.y
          OperateGeometry.data.y = y + sceneShiftXY.y
        })
        .onDestroy(() => {
          Pixi.isForbidEvent = false
          OperateGeometry.afterOperate.dispatch()
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
      Drag.onStart(() => OperateGeometry.beforeOperate.dispatch(['width']))
        .onMove(({ shift }) => {
          const sceneShiftXY = StageViewport.toSceneStageShiftXY(shift)
          OperateGeometry.data.width = width + sceneShiftXY.x
        })
        .onDestroy(() => {
          Pixi.isForbidEvent = false
          OperateGeometry.afterOperate.dispatch()
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
      Drag.onStart(() => OperateGeometry.beforeOperate.dispatch(['height']))
        .onMove(({ shift }) => {
          const sceneShiftXY = StageViewport.toSceneStageShiftXY(shift)
          OperateGeometry.data.height = height + sceneShiftXY.y
        })
        .onDestroy(() => {
          Pixi.isForbidEvent = false
          OperateGeometry.afterOperate.dispatch()
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
      Drag.onStart(() => OperateGeometry.beforeOperate.dispatch(['width']))
        .onMove(({ shift }) => {
          const sceneShiftXY = StageViewport.toSceneStageShiftXY(shift)
          OperateGeometry.data.width = width - sceneShiftXY.x
          OperateGeometry.data.x = x + sceneShiftXY.x
        })
        .onDestroy(() => {
          Pixi.isForbidEvent = false
          OperateGeometry.afterOperate.dispatch()
        })
    })
  }
}

export const StageWidgetTransform = new StageWidgetTransformService()
