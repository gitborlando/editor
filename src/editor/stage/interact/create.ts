import { inject, injectable } from 'tsyringe'
import { SchemaDefaultService, injectSchemaDefault } from '~/editor/schema/default'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { SchemaPageService, injectSchemaPage } from '~/editor/schema/page'
import { ILine, INode } from '~/editor/schema/type'
import { DragService, injectDrag, type IDragData } from '~/editor/utility/drag'
import { RunInAction, autobind } from '~/shared/decorator'
import { IXY } from '~/shared/utils'
import { XY } from '~/shared/xy'
import { StageViewportService, injectStageViewport } from '../viewport'
import { StageInteractService, injectStageInteract } from './interact'

const createTypes = ['frame', 'rect', 'ellipse', 'polygon', 'line', 'text', 'img'] as const
type ICreateType = typeof createTypes[number]

@autobind
@injectable()
export class StageCreateService {
  types = createTypes
  type: ICreateType = 'frame'
  private node!: INode
  private realStageStart!: IXY
  constructor(
    @injectSchemaDefault private SchemaDefault: SchemaDefaultService,
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectSchemaPage private SchemaPage: SchemaPageService,
    @injectDrag private Drag: DragService,
    @injectStageViewport private StageViewport: StageViewportService,
    @injectStageInteract private StageInteract: StageInteractService
  ) {}
  startInteract() {
    this.Drag.onStart(this.onCreateStart).onMove(this.onCreateMove).onEnd(this.onCreateEnd)
  }
  endInteract() {}
  setType(type: ICreateType) {
    this.type = type
    this.StageInteract.setType('create')
  }
  private onCreateStart({ start, dragService }: IDragData) {
    if (!this.StageViewport.inViewport(start)) {
      this.StageInteract.setType('select')
      return dragService.destroy()
    }
    this.realStageStart = this.StageViewport.toRealStageXY(start)
    if (this.type === 'frame') this.createFrameNode()
    if (this.type === 'rect') this.createRectNode()
    if (this.type === 'ellipse') this.createEllipseNode()
    if (this.type === 'line') this.createLineNode()
    if (this.type === 'text') this.createRectNode()
    if (this.type === 'img') this.createRectNode()
    this.addNodeToSchemaAndObserveAndSelect()
  }
  @RunInAction private onCreateMove({ marquee, current }: IDragData) {
    const { x, y } = this.StageViewport.toRealStageXY(marquee)
    const { x: width, y: height } = this.StageViewport.toRealStageShift({
      x: marquee.width,
      y: marquee.height,
    })
    if (this.type === 'ellipse') {
      this.node.x = x + width / 2
      this.node.y = y + height / 2
      this.node.width = width
      this.node.height = height
    } else if (this.type === 'line') {
      ;(this.node as ILine).end = this.StageViewport.toRealStageXY(current)
    } else {
      this.node.x = x
      this.node.y = y
      this.node.width = width
      this.node.height = height
    }
  }
  @RunInAction private onCreateEnd({ dragService }: IDragData) {
    if (!this.node.width) this.node.width = 100
    if (!this.node.height) this.node.height = 100
    this.StageInteract.setType('select')
    dragService.destroy()
  }
  private createFrameNode() {
    this.node = this.SchemaDefault.frame({
      ...this.createMousedownBound(),
    })
  }
  private createRectNode() {
    this.node = this.SchemaDefault.rect({
      ...this.createMousedownBound(),
    })
  }
  private createEllipseNode() {
    this.node = this.SchemaDefault.ellipse({
      ...this.createMousedownBound(),
    })
  }
  private createLineNode() {
    this.node = this.SchemaDefault.line({
      start: XY.From(this.realStageStart),
      end: new XY(0, 0),
    })
  }
  private createMousedownBound() {
    return {
      x: this.realStageStart.x,
      y: this.realStageStart.y,
      width: 0,
      height: 0,
    }
  }
  private addNodeToSchemaAndObserveAndSelect() {
    this.node = this.SchemaNode.add(this.node)
    this.SchemaNode.clearSelection()
    this.SchemaNode.select(this.node.id)
    this.SchemaNode.connect(this.node.id, this.SchemaPage.currentId)
  }
}

export const injectStageCreate = inject(StageCreateService)
