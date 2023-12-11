import { inject, injectable } from 'tsyringe'
import { SchemaDefaultService, injectSchemaDefault } from '~/editor/schema/default'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { IRect } from '~/editor/schema/type'
import { DragService, injectDrag } from '~/editor/utility/drag'
import { SettingService, injectSetting } from '~/editor/utility/setting'
import { Watch, When, autobind } from '~/shared/decorator'
import { XY } from '~/shared/xy'
import { PIXI, PixiService, injectPixi } from '../../pixi'
import { StageViewportService, injectStageViewport } from '../../viewport'
import { StageCTXService, injectStageCTX } from '../ctx/ctx'
import { customPixiCTX } from '../ctx/pixi-ctx'

@autobind
@injectable()
export class StageWidgetTransformerService {
  transformerNode!: IRect
  transformerWidget = new PIXI.Graphics()
  container = new PIXI.Container()
  vertex1 = new PIXI.Graphics()
  vertex2 = new PIXI.Graphics()
  vertex3 = new PIXI.Graphics()
  vertex4 = new PIXI.Graphics()
  constructor(
    @injectPixi private Pixi: PixiService,
    @injectDrag private Drag: DragService,
    @injectStageCTX private StageCTX: StageCTXService,
    @injectStageViewport private StageViewport: StageViewportService,
    @injectSetting private Setting: SettingService,
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectSchemaDefault private SchemaDefault: SchemaDefaultService
  ) {
    this.autoDraw()
  }
  @When('StageViewport.initialized')
  @Watch('SchemaNode.selectIds.values()')
  private autoDraw() {
    if (!this.transformerNode) {
      this.transformerNode = this.SchemaDefault.rect({ id: 'transformer' })
      this.SchemaNode.add(this.transformerNode)
    }
    if (!this.SchemaNode.selectIds) {
      return this.transformerWidget.clear()
    }
    this.transformerWidget.clear()
    this.transformerWidget.setParent(this.Pixi.stage)

    this.setNode()
    this.drawPaint()

    const startXY = XY.From(this.transformerWidget)
    // this.Drag.onSlide(({ shift }) => {
    //   const realShift = this.StageViewport.toRealStageShift(shift)
    //   // node.x = startXY.x + realShift.x
    //   // node.y = startXY.y + realShift.y
    // })
  }
  private setNode() {
    const selectIds = this.SchemaNode.selectIds
    if (selectIds.size === 1) {
      const node = this.SchemaNode.find([...selectIds][0])
      Object.entries(node).forEach(([key, value]) => {
        if (key.match(/x|y|pivotX|pivotY|centerX|centerY|width|height|rotation/)) {
          ;(this.transformerNode as any)[key] = value
        }
      })
      // this.StageCTX.drawRect(pivotX, pivotY, width, height)
      // customPixiCTX(this.StageCTX, this.transformerWidget)
      // drawPath(this.transformerWidget, this.transformerNode, this.StageCTX)
    } else {
    }
  }
  private drawPaint() {
    customPixiCTX(this.StageCTX, this.transformerWidget)
    this.StageCTX.drawStroke(this.transformerWidget, {
      width: 1 / this.StageViewport.zoom,
      color: this.Setting.color,
    })
    this.transformerWidget.beginFill('white', 0)
  }
  private drawBound() {
    const { pivotX, pivotY, centerX, centerY, width, height, rotation } = this.transformerNode
    const vertex1XY = XY.Of(pivotX, pivotY).rotate(XY.Of(centerX, centerY), rotation)
    const vertex2XY = XY.Of(pivotX + width, pivotY).rotate(XY.Of(centerX, centerY), rotation)
    const vertex3XY = XY.Of(pivotX + width, pivotY + height).rotate(
      XY.Of(centerX, centerY),
      rotation
    )
    const vertex4XY = XY.Of(pivotX, pivotY + height).rotate(XY.Of(centerX, centerY), rotation)
    const vertex1 = new PIXI.Graphics()
    const vertex2 = new PIXI.Graphics()
    const vertex3 = new PIXI.Graphics()
    const vertex4 = new PIXI.Graphics()
  }
  private drawVertex(vertex: PIXI.Graphics) {
    // /vertex.drawRect()
  }
}

export const injectStageWidgetMarquee = inject(StageWidgetTransformerService)
