import { SchemaDefault } from '~/editor/schema/default'
import { SchemaNode } from '~/editor/schema/node'
import { SchemaPage } from '~/editor/schema/page'
import { ILine, INode } from '~/editor/schema/type'
import { Drag, type IDragData } from '~/global/drag'
import { autobind } from '~/shared/decorator'
import { createSignal } from '~/shared/signal'
import { XY } from '~/shared/structure/xy'
import { IXY } from '~/shared/utils/normal'
import { StageElement } from '../element'
import { Pixi } from '../pixi'
import { StageViewport } from '../viewport'
import { StageInteract } from './interact'
import { StageTransform } from './transform'

const createTypes = ['frame', 'rect', 'ellipse', 'polygon', 'line', 'text', 'img'] as const
type ICreateType = (typeof createTypes)[number]

@autobind
export class StageCreateService {
  types = createTypes
  type = createSignal(<ICreateType>'frame')
  duringCreate = createSignal()
  private node!: INode
  private realStageStart!: IXY
  constructor() {
    this.type.hook(() => StageInteract.type.dispatch('create'))
  }
  startInteract() {
    Pixi.addListener('mousedown', this.create)
  }
  endInteract() {
    Pixi.removeListener('mousedown', this.create)
  }
  private create() {
    Drag.onStart(this.onCreateStart).onMove(this.onCreateMove).onEnd(this.onCreateEnd)
  }
  private onCreateStart({ start, dragService }: IDragData) {
    if (!StageViewport.inViewport(start)) {
      StageInteract.type.dispatch('select')
      return dragService.destroy()
    }
    this.realStageStart = StageViewport.toRealStageXY(start)
    if (this.type.value === 'frame') this.createFrameNode()
    if (this.type.value === 'rect') this.createRectNode()
    if (this.type.value === 'ellipse') this.createEllipseNode()
    if (this.type.value === 'line') this.createLineNode()
    if (this.type.value === 'text') this.createRectNode()
    if (this.type.value === 'img') this.createRectNode()
    this.addNodeToSchemaAndSelect()
    StageElement.findOrCreate(this.node.id, 'graphic')
  }
  // @RunInAction
  private onCreateMove({ marquee, current }: IDragData) {
    const { x, y } = StageViewport.toRealStageXY(marquee)
    const { x: width, y: height } = StageViewport.toRealStageShiftXY({
      x: marquee.width,
      y: marquee.height,
    })
    if (this.type.value === 'ellipse') {
      this.node.x = x + width / 2
      this.node.y = y + height / 2
      this.node.width = width
      this.node.height = height
    } else if (this.type.value === 'line') {
      ;(this.node as ILine).end = StageViewport.toRealStageXY(current)
    } else {
      const { data } = StageTransform
      data.centerX = x + width / 2
      data.centerY = x + height / 2
      data.width = width
      data.height = height
    }
    this.duringCreate.dispatch()
  }
  // @RunInAction
  private onCreateEnd({ dragService }: IDragData) {
    if (!this.node.width) this.node.width = 100
    if (!this.node.height) this.node.height = 100
    StageInteract.type.dispatch('select')
    dragService.destroy()
  }
  private createFrameNode() {
    this.node = SchemaDefault.frame({
      ...this.createMousedownBound(),
    })
  }
  private createRectNode() {
    this.node = SchemaDefault.rect({
      ...this.createMousedownBound(),
    })
  }
  private createEllipseNode() {
    this.node = SchemaDefault.ellipse({
      ...this.createMousedownBound(),
    })
  }
  private createLineNode() {
    this.node = SchemaDefault.line({
      start: XY.From(this.realStageStart),
      end: new XY(0, 0),
    })
  }
  private createMousedownBound() {
    return {
      x: this.realStageStart.x,
      y: this.realStageStart.y,
      width: 0.01,
      height: 0.01,
    }
  }
  private addNodeToSchemaAndSelect() {
    SchemaNode.add(this.node)
    SchemaNode.clearSelect()
    SchemaNode.select(this.node.id)
    SchemaNode.connectAt(SchemaPage.currentPage.value, this.node)
  }
}

export const StageCreate = new StageCreateService()
