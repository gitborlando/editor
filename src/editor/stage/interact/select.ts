import { observable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { DragService, injectDrag } from '~/editor/drag'
import { XY } from '~/editor/math/xy'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { autobind } from '~/editor/utility/decorator'
import { PIXI, PixiService, injectPixi } from '../pixi'
import { StageViewportService, injectStageViewport } from '../viewport'

@autobind
@injectable()
export class StageSelectService {
  @observable marquee = new PIXI.Graphics()
  constructor(
    @injectPixi private Pixi: PixiService,
    @injectDrag private Drag: DragService,
    @injectStageViewport private StageViewport: StageViewportService,
    @injectSchemaNode private SchemaNode: SchemaNodeService
  ) {}
  startInteract() {
    this.Pixi.addListener('mousedown', this.onDragNodeMove)
    this.Pixi.addListener('mousedown', this.onMousedownSelect)
    this.Pixi.addListener('mousedown', this.onMarqueeSelect)
  }
  endInteract() {
    this.Pixi.removeListener('mousedown', this.onDragNodeMove)
    this.Pixi.removeListener('mousedown', this.onMousedownSelect)
    this.Pixi.removeListener('mousedown', this.onMarqueeSelect)
  }
  private get hoverId() {
    return this.SchemaNode.hoverId
  }
  private onMousedownSelect() {
    if (!this.hoverId) return this.SchemaNode.clearSelection()
    if (this.SchemaNode.selectIds?.has(this.hoverId)) return
    this.SchemaNode.clearSelection()
    this.SchemaNode.select(this.hoverId)
  }
  private onMarqueeSelect() {
    if (this.hoverId) return
    this.Drag.onStart(() => this.Pixi.stage.addChild(this.marquee))
      .onMove(({ marquee: { x, y, width, height } }) => {
        this.marquee.clear()
        this.marquee.lineStyle(1 / this.StageViewport.zoom, 'purple')
        const realStart = this.StageViewport.toRealStageXY(XY.Of(x, y))
        const realShift = this.StageViewport.toRealStageShift(XY.Of(width, height))
        this.marquee.drawRect(realStart.x, realStart.y, realShift.x, realShift.y)
      })
      .onEnd(({ dragService }) => {
        this.marquee.clear()
        dragService.destroy()
      })
  }
  private onDragNodeMove() {
    if (!this.hoverId) return
    const node = this.SchemaNode.find(this.hoverId)
    const startXY = XY.From(node)
    this.Drag.onSlide(({ shift }) => {
      const realShift = this.StageViewport.toRealStageShift(shift)
      node.x = startXY.x + realShift.x
      node.y = startXY.y + realShift.y
    })
  }
}

export const injectStageSelect = inject(StageSelectService)
