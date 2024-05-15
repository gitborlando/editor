import autobind from 'class-autobind-decorator'
import { OperateMeta } from '~/editor/operate/meta'
import { OperateNode } from '~/editor/operate/node'
import { SchemaDefault } from '~/editor/schema/default'
import { Schema } from '~/editor/schema/schema'
import { INode, INodeParent } from '~/editor/schema/type'
import { Drag, type IDragData } from '~/global/event/drag'
import { createSignal } from '~/shared/signal/signal'
import { IXY } from '~/shared/utils/normal'
import { SchemaUtil } from '~/shared/utils/schema'
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
  private createNodeId = ''
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
    const node = this.createNode(start)
    OperateNode.addNodes([node])
    OperateNode.insertAt(this.findParent(), node)
    StageSelect.onCreateSelect(this.createNodeId)
  }
  private onCreateMove({ marquee }: IDragData) {
    const node = Schema.find(this.createNodeId)
    const { x, y, width, height } = StageViewport.toSceneMarquee(marquee)
    Schema.itemReset(node, ['x'], x)
    Schema.itemReset(node, ['y'], y)
    Schema.itemReset(node, ['width'], width)
    Schema.itemReset(node, ['height'], height)
    Schema.commitOperation('创建 node 中...')
    Schema.nextSchema()
  }
  private onCreateEnd() {
    const node = Schema.find<INode>(this.createNodeId)
    if (node.width === 0) {
      Schema.itemReset(node, ['width'], 100)
      Schema.itemReset(node, ['height'], 100)
    }
    Schema.finalOperation('创建节点 ' + node.name)
    StageInteract.currentType.dispatch('select')
  }
  private createNode(start: IXY) {
    const { x, y } = StageViewport.toSceneXY(start)
    const node = SchemaDefault[this.currentType.value]({ x, y, width: 0, height: 0 })
    this.createNodeId = node.id
    return node
  }
  private findParent() {
    const frameId = [...OperateNode.hoverIds.value]
      .reverse()
      .find((id) => SchemaUtil.isById(id, 'frame'))
    if (frameId) return Schema.find<INodeParent>(frameId)
    return OperateMeta.curPage.value
  }
}

export const StageCreate = new StageCreateService()
