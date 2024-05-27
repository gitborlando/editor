import autobind from 'class-autobind-decorator'
import { xy_client } from 'src/editor/math/xy'
import { OperateNode } from 'src/editor/operate/node'
import { Surface } from 'src/editor/stage/render/surface'
import { batchSignal, createSignal } from 'src/shared/signal/signal'
import { SchemaUtil } from 'src/shared/utils/schema'
import { Pixi } from '../pixi'
import { StageViewport } from '../viewport'
import { StageCreate } from './create'
import { StageMove } from './move'
import { StageSelect } from './select'

export type IStageInteractType = 'select' | 'move' | 'create'

@autobind
class StageInteractService {
  currentType = createSignal(<IStageInteractType>'select')
  canHover = createSignal(true)
  private previousType?: IStageInteractType
  private interactHandlerMap = new Map<
    IStageInteractType,
    { startInteract: () => void; endInteract: () => void }
  >()
  initHook() {
    this.interactHandlerMap.set('create', StageCreate)
    this.interactHandlerMap.set('move', StageMove)
    this.interactHandlerMap.set('select', StageSelect)
    this.currentType.hook(this.autoInteract)
    this.currentType.hook(this.autoCursor)
    Surface.inited.hook(() => {
      //  this.bindHover()
      this.currentType.dispatch('select')
    })
  }
  private autoInteract() {
    this.interactHandlerMap.get(this.previousType!)?.endInteract()
    this.interactHandlerMap.get(this.currentType.value)?.startInteract()
    this.previousType = this.currentType.value
  }
  private autoCursor() {
    const cursor = interactCursorMap[this.currentType.value]
    Surface.canvas.style.cursor = cursor
  }
  private bindHover() {
    const handler = (e: Event) => {
      if (Pixi.isForbidEvent) return OperateNode.clearHover()
      OperateNode.clearHover()
      const realXY = StageViewport.toViewportXY(xy_client(e))
      const endBatch = batchSignal(OperateNode.hoverIds)
      SchemaUtil.traverseCurPageChildIds(({ id }) => {
        const { element } = OperateNode.getNodeRuntime(id)
        const hovered = element?.containsPoint(realXY)
        hovered ? OperateNode.hover(id) : OperateNode.unHover(id)
        return hovered
      })
      endBatch()
    }
    this.currentType.hook((type) => this.canHover.dispatch(type === 'select'))
    Pixi.addListener('mousemove', handler, { capture: true })
    Pixi.addListener('mousedown', () => this.canHover.dispatch(false))
    Pixi.addListener('mouseup', () => this.canHover.dispatch(true))
  }
}

export const StageInteract = new StageInteractService()

const interactCursorMap = {
  select: 'auto',
  move: 'grab',
  create: 'crosshair',
}
