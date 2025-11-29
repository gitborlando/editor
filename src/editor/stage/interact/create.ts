import { DragData } from '@gitborlando/utils/browser'
import { HandleNode } from 'src/editor/handle/node'
import { max } from 'src/editor/math/base'
import { OperateGeometry } from 'src/editor/operate/geometry'
import { StageScene } from 'src/editor/render/scene'
import { Surface } from 'src/editor/render/surface'
import { SchemaCreator } from 'src/editor/schema/creator'
import { StageCursor } from 'src/editor/stage/cursor'
import { Drag } from 'src/global/event/drag'
import { IXY } from 'src/shared/utils/normal'
import { SchemaUtil } from 'src/shared/utils/schema'
import { StageViewport } from '../viewport'
import { StageInteract } from './interact'
import { StageSelect } from './select'

const createTypes = [
  'frame',
  'rect',
  'ellipse',
  'line',
  'polygon',
  'star',
  'text',
] as const
export type IStageCreateType = (typeof createTypes)[number]

class StageCreateService {
  createTypes = createTypes
  @observable currentType: IStageCreateType = 'frame'
  private createId = ''

  startInteract() {
    const disposer = Disposer.collect(
      StageScene.sceneRoot.addEvent('mousedown', this.create, { capture: true }),
    )
    StageCursor.setCursor('add').lock()

    return () => {
      disposer()
      StageCursor.unlock().setCursor('select')
    }
  }

  private create() {
    Drag.onStart(this.onCreateStart)
      .onMove(this.onCreateMove)
      .onDestroy(this.onCreateEnd)
  }

  private onCreateStart({ start }: DragData) {
    const node = this.createNode(start)

    HandleNode.addNodes([node])
    HandleNode.insertChildAt(this.findParent(), node)
    StageSelect.onCreateSelect(this.createId)

    if (node.type === 'line') {
      StageCursor.setCursor('move').lock().upReset()
    }
    Surface.disablePointEvent()
  }

  private onCreateMove({ marquee, current, start }: DragData) {
    const node = YState.find(this.createId)

    if (node.type === 'line') {
      current = StageViewport.toSceneXY(current)
      start = StageViewport.toSceneXY(start)
      const rotation = Angle.atan2(current.y - start.y, current.x - start.x)
      const width = max(1, XY.from(current).getDistance(start))
      OperateGeometry.setActiveGeometries(
        { x: start.x, y: start.y, width, rotation },
        false,
      )
    } else {
      const { x, y, width, height } = StageViewport.toSceneMarquee(marquee)
      OperateGeometry.setActiveGeometries(
        { x, y, width: max(1, width), height: max(1, height) },
        false,
      )
    }
  }

  private onCreateEnd() {
    const node = YState.find<V1.Node>(this.createId)

    if (node.width === 1) {
      YState.set(`${node.id}.width`, 100)
      if (node.type !== 'line') {
        YState.set(`${node.id}.height`, 100)
      }
    }

    YUndo.track({
      type: 'all',
      description: sentence(t('verb.create'), t('noun.node'), ': ', node.name),
    })
    StageInteract.interaction = 'select'
  }

  private createNode(start: IXY) {
    const { x, y } = StageViewport.toSceneXY(start)

    const node = SchemaCreator[this.currentType]({ x, y, width: 1, height: 1 })
    node.name = SchemaCreator.createNodeName(this.currentType)
    this.createId = node.id

    return node
  }

  private findParent() {
    const frame = StageScene.elemsFromPoint().find((elem) =>
      SchemaUtil.isById(elem.id, 'frame'),
    )
    if (frame) return YState.find<V1.NodeParent>(frame.id)
    return YState.find<V1.Page>(YClients.client.selectPageId)
  }
}

export const StageCreate = autoBind(makeObservable(new StageCreateService()))
