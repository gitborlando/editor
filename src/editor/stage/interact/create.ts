import autobind from 'class-autobind-decorator'
import { OperateGeometry } from '~/editor/operate/geometry'
import { Record } from '~/editor/record'
import { SchemaDefault } from '~/editor/schema/default'
import { SchemaNode } from '~/editor/schema/node'
import { SchemaPage } from '~/editor/schema/page'
import { IFrame, ILine, INode } from '~/editor/schema/type'
import { SchemaUtil } from '~/editor/schema/util'
import { Drag, type IDragData } from '~/global/event/drag'
import { createSignal } from '~/shared/signal'
import { XY } from '~/shared/structure/xy'
import { IXY } from '~/shared/utils/normal'
import { Pixi } from '../pixi'
import { StageViewport } from '../viewport'
import { StageInteract } from './interact'
import { StageSelect } from './select'

const createTypes = ['frame', 'rect', 'ellipse', 'line', 'polygon', 'star', 'image'] as const
export type IStageCreateType = (typeof createTypes)[number]

@autobind
export class StageCreateService {
  createTypes = createTypes
  currentType = createSignal<IStageCreateType>('frame')
  createStarted = createSignal<string>()
  createFinished = createSignal()
  private node!: INode
  private sceneStageStart!: IXY
  initHook() {
    this.currentType.hook(() => {
      StageInteract.currentType.dispatch('create')
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
    Record.startAction()
    this.createNode()
    SchemaNode.addNodes([this.node])
    SchemaNode.connectAt(this.findContainer(), this.node)
    StageSelect.onCreateSelect(this.node.id)
    OperateGeometry.beforeOperate.dispatch(['x', 'y', 'width', 'height'])
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
  }
  private onCreateEnd() {
    if (OperateGeometry.data.width === 0) {
      OperateGeometry.data.width = 100
      OperateGeometry.data.height = 100
    }
    OperateGeometry.afterOperate.dispatch()
    StageInteract.currentType.dispatch('select')
    Record.endAction('创建节点')
    this.createFinished.dispatch()
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
  }
  private createMousedownBound() {
    const { x, y } = this.sceneStageStart
    const [width, height, centerX, centerY] = [1, 1, x + 0.5, y + 0.5]
    return { x, y, width, height, centerX, centerY }
  }
  private findContainer() {
    const frameId = [...SchemaNode.hoverIds.value].reverse().find(SchemaUtil.isFrameId)
    if (frameId) return SchemaNode.find(frameId) as IFrame
    return SchemaPage.currentPage.value
  }
}

export const StageCreate = new StageCreateService()
