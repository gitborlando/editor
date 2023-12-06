import { observable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { DragService, injectDrag } from '~/editor/drag'
import { XY } from '~/editor/math/xy'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { autobind } from '~/editor/utility/decorator'
import { PIXI, PixiService, injectPixi } from '../pixi'
import { ViewportService, injectViewport } from '../viewport'

@autobind
@injectable()
export class StageSelectService {
  @observable marquee = new PIXI.Graphics()
  constructor(
    @injectPixi private pixiService: PixiService,
    @injectDrag private dragService: DragService,
    @injectViewport private viewportService: ViewportService,
    @injectSchemaNode private schemaNodeService: SchemaNodeService
  ) {}
  startInteract() {
    this.pixiService.addListener('mousedown', this.onDragNodeMove)
    this.pixiService.addListener('mousedown', this.onMousedownSelect)
    this.pixiService.addListener('mousedown', this.onMarqueeSelect)
  }
  endInteract() {
    this.pixiService.removeListener('mousedown', this.onDragNodeMove)
    this.pixiService.removeListener('mousedown', this.onMousedownSelect)
    this.pixiService.removeListener('mousedown', this.onMarqueeSelect)
  }
  private get hoverId() {
    return this.schemaNodeService.hoverId
  }
  private onMousedownSelect() {
    if (!this.hoverId) return this.schemaNodeService.clearSelection()
    if (this.schemaNodeService.selectIds?.has(this.hoverId)) return
    this.schemaNodeService.clearSelection()
    this.schemaNodeService.select(this.hoverId)
  }
  private onMarqueeSelect() {
    if (this.hoverId) return
    this.dragService
      .onStart(() => this.pixiService.stage.addChild(this.marquee))
      .onMove(({ marquee: { x, y, width, height } }) => {
        this.marquee.clear()
        this.marquee.lineStyle(1 / this.viewportService.zoom, 'purple')
        const realStart = this.viewportService.toRealStageXY(XY.Of(x, y))
        const realShift = this.viewportService.toRealStageShift(XY.Of(width, height))
        this.marquee.drawRect(realStart.x, realStart.y, realShift.x, realShift.y)
      })
      .onEnd(({ dragService }) => {
        this.marquee.clear()
        dragService.destroy()
      })
  }
  private onDragNodeMove() {
    if (!this.hoverId) return
    const node = this.schemaNodeService.find(this.hoverId)
    const startXY = XY.From(node)
    this.dragService.onSlide(({ shift }) => {
      const realShift = this.viewportService.toRealStageShift(shift)
      node.x = startXY.x + realShift.x
      node.y = startXY.y + realShift.y
    })
  }
}

export const injectStageSelect = inject(StageSelectService)
