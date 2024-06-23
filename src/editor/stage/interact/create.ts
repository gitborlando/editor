import autobind from 'class-autobind-decorator'
import { ratan2 } from 'src/editor/math/base'
import { xy_distance } from 'src/editor/math/xy'
import { OperateNode } from 'src/editor/operate/node'
import { OperatePage } from 'src/editor/operate/page'
import { SchemaDefault } from 'src/editor/schema/default'
import { Schema } from 'src/editor/schema/schema'
import { INode, INodeParent } from 'src/editor/schema/type'
import { StageCursor } from 'src/editor/stage/cursor'
import { StageScene } from 'src/editor/stage/render/scene'
import { Surface } from 'src/editor/stage/render/surface'
import { Drag, type IDragData } from 'src/global/event/drag'
import { createSignal } from 'src/shared/signal/signal'
import { IXY } from 'src/shared/utils/normal'
import { SchemaUtil } from 'src/shared/utils/schema'
import { StageViewport } from '../viewport'
import { StageInteract } from './interact'
import { StageSelect } from './select'

const createTypes = ['frame', 'rect', 'ellipse', 'line', 'polygon', 'star', 'text'] as const
export type IStageCreateType = (typeof createTypes)[number]

@autobind
class StageCreateService {
  createTypes = createTypes
  currentType = createSignal<IStageCreateType>('frame')
  private createId = ''

  startInteract() {
    StageScene.sceneRoot.addEvent('mousedown', this.create, { capture: true })
    StageCursor.setCursor('add').lock()
  }

  endInteract() {
    StageScene.sceneRoot.removeEvent('mousedown', this.create, { capture: true })
    StageCursor.unlock().setCursor('select')
  }

  private create() {
    Drag.onDown(this.onCreateStart).onMove(this.onCreateMove).onDestroy(this.onCreateEnd)
  }

  private onCreateStart({ start }: IDragData) {
    const node = this.createNode(start)

    OperateNode.addNodes([node])
    OperateNode.insertAt(this.findParent(), node)
    StageSelect.onCreateSelect(this.createId)

    if (node.type === 'line') {
      StageCursor.setCursor('move').lock().upReset()
    }
  }

  private onCreateMove({ marquee, current, start }: IDragData) {
    const node = Schema.find(this.createId)

    if (node.type === 'line') {
      current = StageViewport.toSceneXY(current)
      start = StageViewport.toSceneXY(start)
      const rotation = ratan2(current.y - start.y, current.x - start.x)
      Schema.itemReset(node, ['x'], start.x)
      Schema.itemReset(node, ['y'], start.y)
      Schema.itemReset(node, ['width'], xy_distance(current, start))
      Schema.itemReset(node, ['rotation'], rotation)
    } else {
      const { x, y, width, height } = StageViewport.toSceneMarquee(marquee)
      Schema.itemReset(node, ['x'], x)
      Schema.itemReset(node, ['y'], y)
      Schema.itemReset(node, ['width'], width)
      Schema.itemReset(node, ['height'], height)
    }

    Schema.commitOperation('创建 node 中...')
    Schema.nextSchema()
  }

  private onCreateEnd() {
    const node = Schema.find<INode>(this.createId)

    if (node.width === 0) {
      Schema.itemReset(node, ['width'], 100)
      if (node.type !== 'line') {
        Schema.itemReset(node, ['height'], 100)
      }
    }

    Schema.finalOperation('创建节点 ' + node.name)
    StageInteract.currentType.dispatch('select')
  }

  private createNode(start: IXY) {
    const { x, y } = StageViewport.toSceneXY(start)

    const node = SchemaDefault[this.currentType.value]({ x, y, width: 0, height: 0 })
    this.createId = node.id

    return node
  }

  private findParent() {
    const frame = Surface.elemsFromPoint[0].find((elem) => SchemaUtil.isById(elem.id, 'frame'))

    if (frame) return Schema.find<INodeParent>(frame.id)
    return OperatePage.currentPage
  }
}

export const StageCreate = new StageCreateService()
