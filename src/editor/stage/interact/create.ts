import autobind from 'class-autobind-decorator'
import { sqrt } from '~/editor/math/base'
import { OperateGeometry } from '~/editor/operate/geometry'
import { OperateMeta } from '~/editor/operate/meta'
import { OperateNode } from '~/editor/operate/node'
import { SchemaDefault } from '~/editor/schema/default'
import { SchemaHistory } from '~/editor/schema/history'
import { Schema } from '~/editor/schema/schema'
import { INode, INodeParent } from '~/editor/schema/type'
import { SchemaUtil } from '~/editor/schema/util'
import { Drag, type IDragData } from '~/global/event/drag'
import { createSignal } from '~/shared/signal/signal'
import { IXY } from '~/shared/utils/normal'
import { Pixi } from '../pixi'
import { StageViewport } from '../viewport'
import { StageInteract } from './interact'
import { StageSelect } from './select'

const createTypes = ['frame', 'rect', 'ellipse', 'line', 'polygon', 'star', 'text'] as const
export type IStageCreateType = (typeof createTypes)[number]

@autobind
class StageCreateService {
  createTypes = createTypes
  currentType = createSignal<IStageCreateType>('frame')
  createStarted = createSignal<string>()
  createFinished = createSignal()
  private node!: INode
  private sceneStageStart!: IXY
  initHook() {}
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
    SchemaHistory.startAction()
    OperateNode.addNodes([this.node])
    OperateNode.insertAt(this.findParent(), this.node)
    StageSelect.onCreateSelect(this.node.id)
    OperateGeometry.beforeOperate.dispatch(['width', 'height'])
  }
  private onCreateMove({ marquee }: IDragData) {
    const { x, y } = StageViewport.toSceneStageXY(marquee)
    const width = StageViewport.toSceneStageShift(marquee.width)
    const height = StageViewport.toSceneStageShift(marquee.height)
    OperateGeometry.setGeometry('x', x)
    OperateGeometry.setGeometry('y', y)
    if (this.currentType.value === 'line') {
      OperateGeometry.setGeometry('width', sqrt(width ** 2 + height ** 2))
    } else {
      OperateGeometry.setGeometry('x', x)
      OperateGeometry.setGeometry('y', y)
      OperateGeometry.setGeometry('width', width)
      OperateGeometry.setGeometry('height', height)
    }
  }
  private onCreateEnd() {
    if (OperateGeometry.geometry.width === 0) {
      OperateGeometry.setGeometry('width', 100)
      OperateGeometry.setGeometry('height', 100)
    }
    OperateGeometry.afterOperate.dispatch()
    Schema.finalOperation('创建节点 ' + this.node.name)
    SchemaHistory.endActionWithCommit('创建节点 ' + this.node.name)
    StageInteract.currentType.dispatch('select')
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
        ...this.createMousedownBound(),
      })
    }
    if (this.currentType.value === 'text') {
      this.node = SchemaDefault.text({
        ...this.createMousedownBound(),
      })
    }
  }
  private createMousedownBound() {
    const { x, y } = this.sceneStageStart
    const [width, height, centerX, centerY] = [0, 0, x, y]
    return { x, y, width, height, centerX, centerY }
  }
  private findParent() {
    console.log(OperateNode.hoverIds.value)
    const frameId = [...OperateNode.hoverIds.value]
      .reverse()
      .find((id) => SchemaUtil.isById(id, 'frame'))
    if (frameId) return Schema.find<INodeParent>(frameId)
    return OperateMeta.curPage.value
  }
}

export const StageCreate = new StageCreateService()
