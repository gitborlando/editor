import { makeObservable, observable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { DragService, injectDrag } from '~/editor/drag'
import { XY } from '~/editor/math/xy'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { autobind } from '~/helper/decorator'
import { noopFunc } from '~/helper/utils'
import { PIXI, PixiService, injectPixi } from '../pixi'
import { listenInteractTypeChange } from '../stage'
import { ViewportService, injectViewport } from '../viewport'

@autobind
@injectable()
export class StageSelectService {
  @observable hoverId = ''
  private clickSelectHandler = noopFunc
  private marqueeSelectHandler = noopFunc
  constructor(
    @injectPixi private pixiService: PixiService,
    @injectDrag private dragService: DragService,
    @injectViewport private viewportService: ViewportService,
    @injectSchemaNode private schemaNodeService: SchemaNodeService
  ) {
    makeObservable(this)
    listenInteractTypeChange(this, 'select')
  }
  setHoverId(id: string) {
    this.hoverId = id
  }
  startInteract() {
    this.onClickSelect()
    this.onMarqueeSelect()
  }
  endInteract() {
    this.pixiService.removeListener('mousedown', this.clickSelectHandler)
    this.pixiService.removeListener('mousedown', this.marqueeSelectHandler)
  }
  private onClickSelect() {
    this.clickSelectHandler = () => {
      if (!this.hoverId) return
      if (
        this.schemaNodeService.selectedIds.length &&
        this.schemaNodeService.selectedIds[0] === this.hoverId
      )
        return
      this.schemaNodeService.observe(this.hoverId)
      this.schemaNodeService.selectedIds = []
      this.schemaNodeService.select(this.hoverId)
    }
    this.pixiService.addListener('mousedown', this.clickSelectHandler)
  }
  private onMarqueeSelect() {
    this.marqueeSelectHandler = () => {
      if (this.hoverId) return
      let marquee: PIXI.Graphics
      this.dragService
        .onStart(() => {
          marquee = new PIXI.Graphics()
          this.pixiService.stage.addChild(marquee)
        })
        .onMove(({ marquee: { x, y, width, height } }) => {
          marquee.clear()
          marquee.lineStyle(1 / this.viewportService.zoom, 'purple')
          // marquee.lineStyle(1, 'rgba(0, 145, 255, 0.53)')
          const realStart = this.viewportService.toRealStageXY(new XY(x, y))
          const realShift = this.viewportService.toRealStageShift(new XY(width, height))
          marquee.drawRect(realStart.x, realStart.y, realShift.x, realShift.y)
        })
        .onEnd(({ dragService }) => {
          marquee.destroy()
          dragService.endListen()
        })
    }
    this.pixiService.addListener('mousedown', this.marqueeSelectHandler)
  }
}

export const injectStageSelect = inject(StageSelectService)
