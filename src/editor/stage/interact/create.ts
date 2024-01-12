import { OBB } from '~/editor/math/obb'
import { SchemaDefault } from '~/editor/schema/default'
import { SchemaNode } from '~/editor/schema/node'
import { ILine, INode } from '~/editor/schema/type'
import { Drag, type IDragData } from '~/global/event/drag'
import { autobind } from '~/shared/decorator'
import { createSignal } from '~/shared/signal'
import { XY } from '~/shared/structure/xy'
import { IXY } from '~/shared/utils/normal'
import { StageElement } from '../element'
import { Pixi } from '../pixi'
import { StageViewport } from '../viewport'
import { StageInteract } from './interact'

const createTypes = ['frame', 'rect', 'ellipse', 'polygon', 'line', 'text', 'img'] as const
type ICreateType = (typeof createTypes)[number]

@autobind
export class StageCreateService {
  types = createTypes
  type = createSignal<ICreateType>('frame')
  duringCreate = createSignal()
  private node!: INode
  private realStageStart!: IXY
  private OBB!: OBB
  initHook() {
    this.type.hook(() => StageInteract.type.dispatch('create'))
  }
  startInteract() {
    Pixi.addListener('mousedown', this.create)
  }
  endInteract() {
    Pixi.removeListener('mousedown', this.create)
  }
  private create() {
    Drag.onDown(this.onCreateStart).onMove(this.onCreateMove).onDestroy(this.onCreateEnd)
  }
  private onCreateStart({ start }: IDragData) {
    this.realStageStart = StageViewport.toRealStageXY(start)
    this.createNode()
    SchemaNode.add(this.node)
    SchemaNode.collectRedraw(this.node.id)
    StageElement.findOrCreate(this.node.id, 'graphic')
    this.OBB = StageElement.OBBCache.get(this.node.id)
  }
  private onCreateMove({ marquee, current }: IDragData) {
    const { x, y } = StageViewport.toRealStageXY(marquee)
    const width = StageViewport.toRealStageShift(marquee.width)
    const height = StageViewport.toRealStageShift(marquee.height)
    if (this.type.value === 'ellipse') {
      this.node.x = x + width / 2
      this.node.y = y + height / 2
      this.node.width = width
      this.node.height = height
    } else if (this.type.value === 'line') {
      ;(this.node as ILine).end = StageViewport.toRealStageXY(current)
    } else {
      this.node.centerX = x + width / 2
      this.node.centerY = y + height / 2
      this.node.width = width
      this.node.height = height
    }
    this.OBB.reBound(width, height, this.node.centerX, this.node.centerY)
    SchemaNode.collectRedraw(this.node.id)
    this.duringCreate.dispatch()
  }
  private onCreateEnd() {
    const [width, height, centerX, centerY] = [100, 100, this.node.x + 50, this.node.y + 50]
    if (this.node.width === 0.01) {
      this.node.width = width
      this.node.height = height
      this.node.centerX = centerX
      this.node.centerY = centerY
      this.OBB.reBound(width, height, centerX, centerY)
    }
    SchemaNode.collectRedraw(this.node.id)
    this.duringCreate.dispatch()
    StageInteract.type.dispatch('select')
  }
  private createNode() {
    if (this.type.value === 'frame') this.createFrameNode()
    if (this.type.value === 'rect') this.createRectNode()
    if (this.type.value === 'ellipse') this.createEllipseNode()
    if (this.type.value === 'line') this.createLineNode()
    if (this.type.value === 'text') this.createRectNode()
    if (this.type.value === 'img') this.createRectNode()
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
    const { x, y } = this.realStageStart
    return {
      x,
      y,
      width: 0.01,
      height: 0.01,
      centerX: x + 0.005,
      centerY: y + 0.005,
    }
  }
}

export const StageCreate = new StageCreateService()
