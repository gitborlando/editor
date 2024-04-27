import autobind from 'class-autobind-decorator'
import { OperateNode } from '~/editor/operate/node'
import { SchemaUtil } from '~/editor/schema/util'
import { Drag } from '~/global/event/drag'
import { batchSignal, createSignal } from '~/shared/signal/signal'
import { XY } from '~/shared/xy'
import { StageElement } from '../element'
import { Pixi } from '../pixi'
import { StageViewport } from '../viewport'
import { StageCreate } from './create'
import { StageMove } from './move'
import { StageSelect } from './select'

export type IStageInteractType = 'select' | 'move' | 'create'

@autobind
export class StageInteractService {
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
    Pixi.inited.hook(() => {
      this.bindHover()
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
    Drag.setCursor(cursor)
    Pixi.htmlContainer.style.cursor = cursor
  }
  private bindHover() {
    const handler = (e: Event) => {
      OperateNode.clearHover()
      const realXY = StageViewport.toViewportXY(XY.From(e, 'client'))
      const endBatch = batchSignal(OperateNode.hoverIds)
      SchemaUtil.traverseCurPageChildIds(({ id }) => {
        const element = StageElement.findElement(id)
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
