import { makeObservable, observable } from 'mobx'
import { DragService } from '~/editor/drag'
import { SchemaNodeService } from '~/editor/schema/node'
import { autoBind } from '~/helper/decorator'
import { noopFunc } from '~/helper/utils'
import { PIXI, PixiService } from '../pixi'
import { listenInteractTypeChange } from '../stage'

@autoBind
export class StageInteractSelectService {
  @observable hoverId = ''
  private clickSelectHandler = noopFunc
  private marqueeSelectHandler = noopFunc
  constructor(
    private pixiService: PixiService,
    private dragService: DragService,
    private schemaNodeService: SchemaNodeService
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
          marquee.lineStyle(1, 'purple')
          // marquee.lineStyle(1, 'rgba(0, 145, 255, 0.53)')
          marquee.drawRect(x, y, width, height)
        })
        .onEnd(({ dragService: drag }) => {
          marquee.destroy()
          drag.endListen()
        })
    }
    this.pixiService.addListener('mousedown', this.marqueeSelectHandler)
  }
}
