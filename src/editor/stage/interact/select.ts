import { makeObservable, observable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { OBB } from '~/editor/math/obb'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { DragService, injectDrag } from '~/editor/utility/drag'
import { MenuService, injectMenu } from '~/global/menu'
import { autobind } from '~/shared/decorator'
import { XY } from '~/shared/structure/xy'
import { createBound, type IBound } from '~/shared/utils'
import { PixiService, injectPixi } from '../pixi'
import { StageViewportService, injectStageViewport } from '../viewport'

@autobind
@injectable()
export class StageSelectService {
  @observable marquee?: IBound
  private stageMarqueeOBB?: OBB
  constructor(
    @injectPixi private Pixi: PixiService,
    @injectDrag private Drag: DragService,
    @injectStageViewport private StageViewport: StageViewportService,
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectMenu private Menu: MenuService
  ) {
    makeObservable(this)
  }
  startInteract() {
    this.Pixi.addListener('mousedown', this.onDragNodeMove)
    this.Pixi.addListener('mousedown', this.onMousedownSelect)
    this.Pixi.addListener('mousedown', this.onMarqueeSelect)
    this.Pixi.addListener('mousedown', this.onMenu)
  }
  endInteract() {
    this.Pixi.removeListener('mousedown', this.onDragNodeMove)
    this.Pixi.removeListener('mousedown', this.onMousedownSelect)
    this.Pixi.removeListener('mousedown', this.onMarqueeSelect)
    this.Pixi.removeListener('mousedown', this.onMenu)
  }
  private get hoverId() {
    return this.SchemaNode.hoverId
  }
  private onMousedownSelect(e: Event) {
    if ((e as any).button !== 0) return
    if (!this.hoverId) return this.SchemaNode.clearSelection()
    if (this.SchemaNode.selectIds?.has(this.hoverId)) return
    this.SchemaNode.clearSelection()
    this.SchemaNode.select(this.hoverId)
  }
  private onMarqueeSelect(_e: Event) {
    const e = _e as MouseEvent
    if (e.button !== 0) return
    if (this.hoverId) return
    const nodesIds = Object.keys(this.SchemaNode.nodeMap)
    this.Drag.onStart(() => (this.marquee = createBound(0, 0, 0, 0)))
      .onMove(({ marquee }) => {
        this.marquee = marquee
        this.stageMarqueeOBB = this.calcStageMarqueeOBB()
        nodesIds.forEach((id) => {
          const nodeRuntime = this.SchemaNode.findNodeRuntime(id)
          const testResult = this.stageMarqueeOBB?.hitTest(nodeRuntime.OBB)
          testResult ? this.SchemaNode.select(id) : this.SchemaNode.unSelect(id)
        })
      })
      .onEnd(({ dragService }) => {
        this.marquee = undefined
        this.SchemaNode.clearSelection()
        dragService.destroy()
      })
  }
  private onDragNodeMove(e: Event) {
    if ((e as any).button !== 0) return
    if (!this.hoverId) return
    // const node = this.SchemaNode.find(this.hoverId)
    // const startXY = XY.From(node)
    // this.Drag.onSlide(({ shift }) => {
    //   const realShift = this.StageViewport.toRealStageShift(shift)
    //   node.x = startXY.x + realShift.x
    //   node.y = startXY.y + realShift.y
    // })
  }
  private onMenu(_e: Event) {
    const e = _e as MouseEvent
    if (e.button !== 2) return
    this.Menu.setShow(true)
    this.Menu.setXY(e.clientX, e.clientY)
  }
  private calcStageMarqueeOBB() {
    if (!this.marquee) return
    const { x, y } = this.StageViewport.toRealStageXY(XY.Of(this.marquee.x, this.marquee.y))
    const { x: width, y: height } = this.StageViewport.toRealStageShift(
      XY.Of(this.marquee.width, this.marquee.height)
    )
    return new OBB(x + width / 2, y + height / 2, width, height, 0)
  }
}

export const injectStageSelect = inject(StageSelectService)
