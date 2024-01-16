import autobind from 'class-autobind-decorator'
import { OBB } from '~/editor/math/obb'
import { SchemaDefault } from '~/editor/schema/default'
import { SchemaNode } from '~/editor/schema/node'
import { ILine, INode } from '~/editor/schema/type'
import { Drag, type IDragData } from '~/global/event/drag'
import { createSignal } from '~/shared/signal'
import { XY } from '~/shared/structure/xy'
import { IXY } from '~/shared/utils/normal'
import { StageElement } from '../element'
import { Pixi } from '../pixi'
import { StageViewport } from '../viewport'
import { StageInteract } from './interact'

// const createTypes = ['text'] as const
const createTypes = ['frame', 'rect', 'ellipse', 'polygon', 'line', 'image', 'star'] as const
export type IStageCreateType = (typeof createTypes)[number]

@autobind
export class StageCreateService {
  createTypes = createTypes
  currentType = createSignal<IStageCreateType>('frame')
  createStarted = createSignal<string>()
  duringCreate = createSignal()
  private node!: INode
  private sceneStageStart!: IXY
  private OBB!: OBB
  initHook() {
    this.currentType.hook(() => {
      StageInteract.type.dispatch('create')
    })
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
    this.sceneStageStart = StageViewport.toRealStageXY(start)
    this.createNode()
    SchemaNode.add(this.node)
    StageElement.findOrCreate(this.node.id, 'graphic')
    this.OBB = StageElement.OBBCache.get(this.node.id)
    this.createStarted.dispatch(this.node.id)
  }
  private onCreateMove({ marquee, current }: IDragData) {
    const { x, y } = StageViewport.toRealStageXY(marquee)
    const width = StageViewport.toRealStageShift(marquee.width)
    const height = StageViewport.toRealStageShift(marquee.height)
    if (this.currentType.value === 'line') {
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
    if (this.currentType.value === 'frame') {
      this.node = SchemaDefault.frame({
        ...this.createMousedownBound(),
      })
    }
    if (this.currentType.value === 'rect') {
      this.node = SchemaDefault.rect({
        ...this.createMousedownBound(),
      })
    }
    if (this.currentType.value === 'polygon') {
      this.node = SchemaDefault.polygon({
        ...this.createMousedownBound(),
      })
    }
    if (this.currentType.value === 'ellipse') {
      this.node = SchemaDefault.ellipse({
        ...this.createMousedownBound(),
      })
    }
    if (this.currentType.value === 'star') {
      this.node = SchemaDefault.star({
        ...this.createMousedownBound(),
      })
    }
    if (this.currentType.value === 'line') {
      this.node = SchemaDefault.line({
        start: XY.From(this.sceneStageStart),
        end: new XY(0, 0),
      })
    }
    // if (this.currentType.value === 'text') this.createRectNode()
    // if (this.currentType.value === 'img') this.createRectNode()
  }
  private createMousedownBound() {
    const { x, y } = this.sceneStageStart
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
