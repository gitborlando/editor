import autobind from 'class-autobind-decorator'
import { OperateGeometry } from '~/editor/operate/geometry'
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
  private node!: INode
  private sceneStageStart!: IXY
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
    this.sceneStageStart = StageViewport.toSceneStageXY(start)
    this.createNode()
    SchemaNode.add(this.node)
    StageElement.findOrCreate(this.node.id, 'graphic')
    this.createStarted.dispatch(this.node.id)
  }
  private onCreateMove({ marquee, current }: IDragData) {
    const { x, y } = StageViewport.toSceneStageXY(marquee)
    const width = StageViewport.toSceneStageShift(marquee.width)
    const height = StageViewport.toSceneStageShift(marquee.height)
    if (this.currentType.value === 'line') {
      ;(this.node as ILine).end = StageViewport.toSceneStageXY(current)
    } else {
      OperateGeometry.data.x = x
      OperateGeometry.data.y = y
      OperateGeometry.data.width = width
      OperateGeometry.data.height = height
    }
    OperateGeometry.afterOperate.dispatch()
  }
  private onCreateEnd() {
    if (OperateGeometry.data.width === 0) {
      OperateGeometry.data.width = 100
      OperateGeometry.data.height = 100
      OperateGeometry.afterOperate.dispatch()
    }
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
      width: 0,
      height: 0,
      centerX: x,
      centerY: y,
    }
  }
}

export const StageCreate = new StageCreateService()
