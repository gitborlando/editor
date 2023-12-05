import { inject, injectable } from 'tsyringe'
import { DragService, injectDrag, type IDragData } from '~/editor/drag'
import { XY } from '~/editor/math/xy'
import { SchemaDefaultService, injectSchemaDefault } from '~/editor/schema/default'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { SchemaPageService, injectSchemaPage } from '~/editor/schema/page'
import { ILine, INode } from '~/editor/schema/type'
import { autobind, runInAction } from '~/editor/utility/decorator'
import { IXY } from '~/editor/utility/utils'
import { ViewportService, injectViewport } from '../viewport'
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
    @injectSchemaDefault private schemaDefaultService: SchemaDefaultService,
    @injectSchemaNode private schemaNodeService: SchemaNodeService,
    @injectSchemaPage private schemaPageService: SchemaPageService,
    @injectDrag private dragService: DragService,
    @injectViewport private viewportService: ViewportService,
    @injectStageInteract private stageInteractService: StageInteractService
  ) {}
  startInteract() {
    this.dragService.onStart(this.onCreateStart).onMove(this.onCreateMove).onEnd(this.onCreateEnd)
  }
  endInteract() {}
  setType(type: ICreateType) {
    this.type = type
    this.stageInteractService.setType('create')
  }
  private onCreateStart({ start, dragService }: IDragData) {
    if (!this.viewportService.inViewport(start)) {
      this.stageInteractService.setType('select')
      return dragService.destroy()
    }
    this.realStageStart = this.viewportService.toRealStageXY(start)
    if (this.type === 'frame') this.createFrameNode()
    if (this.type === 'rect') this.createRectNode()
    if (this.type === 'ellipse') this.createEllipseNode()
    if (this.type === 'line') this.createLineNode()
    if (this.type === 'text') this.createRectNode()
    if (this.type === 'img') this.createRectNode()
    this.addNodeToSchemaAndObserveAndSelect()
  }
  @runInAction private onCreateMove({ marquee, current }: IDragData) {
    const { x, y } = this.viewportService.toRealStageXY(marquee)
    const { x: width, y: height } = this.viewportService.toRealStageShift({
      x: marquee.width,
      y: marquee.height,
    })
    if (this.type === 'ellipse') {
      this.node.x = x + width / 2
      this.node.y = y + height / 2
      this.node.width = width
      this.node.height = height
    } else if (this.type === 'line') {
      ;(this.node as ILine).end = this.viewportService.toRealStageXY(current)
    } else {
      this.node.x = x
      this.node.y = y
      this.node.width = width
      this.node.height = height
    }
  }
  @runInAction private onCreateEnd({ dragService }: IDragData) {
    if (!this.node.width) this.node.width = 100
    if (!this.node.height) this.node.height = 100
    this.stageInteractService.setType('select')
    dragService.destroy()
  }
  private createFrameNode() {
    this.node = this.schemaDefaultService.frame({
      ...this.createMousedownBound(),
    })
  }
  private createRectNode() {
    this.node = this.schemaDefaultService.rect({
      ...this.createMousedownBound(),
    })
  }
  private createEllipseNode() {
    this.node = this.schemaDefaultService.ellipse({
      ...this.createMousedownBound(),
    })
  }
  private createLineNode() {
    this.node = this.schemaDefaultService.line({
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
    this.node = this.schemaNodeService.add(this.node)
    this.schemaNodeService.clearSelection()
    this.schemaNodeService.select(this.node.id)
    this.schemaNodeService.connect(this.node.id, this.schemaPageService.currentId)
  }
}

export const injectStageCreate = inject(StageCreateService)
