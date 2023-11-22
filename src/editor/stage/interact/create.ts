import { DragService } from '~/editor/drag'
import { SchemaDefaultService } from '~/editor/schema/default'
import { SchemaNodeService } from '~/editor/schema/node'
import { SchemaPageService } from '~/editor/schema/page'
import { INode } from '~/editor/schema/type'
import { IXY } from '~/editor/utils'
import { autoBind } from '~/helper/decorator'
import { StageShapeDrawService } from '../shape/draw'
import { StageService, listenInteractTypeChange } from '../stage'
import { ViewportService } from '../viewport'

const createTypes = ['frame', 'rect', 'ellipse', 'polygon', 'line', 'text', 'img'] as const
type ICreateType = typeof createTypes[number]

@autoBind
export class StageInteractCreateService {
  types = createTypes
  type: ICreateType = 'frame'
  private _node?: INode
  constructor(
    private dragService: DragService,
    private stageService: StageService,
    private schemaDefaultService: SchemaDefaultService,
    private schemaNodeService: SchemaNodeService,
    private schemaPageService: SchemaPageService,
    private shapeDrawService: StageShapeDrawService,
    private viewportService: ViewportService
  ) {
    listenInteractTypeChange(this, 'create')
  }
  private get node(): INode {
    return this._node!
  }
  startInteract() {
    this.dragService
      .onStart(({ start }) => {
        const realStageStart = this.viewportService.toRealStageXY(start)
        if (this.type === 'frame') this.createRect(realStageStart)
        if (this.type === 'rect') this.createRect(realStageStart)
        if (this.type === 'ellipse') this.createEllipse(realStageStart)
        if (this.type === 'line') this.createRect(realStageStart)
        if (this.type === 'text') this.createRect(realStageStart)
        if (this.type === 'img') this.createRect(realStageStart)
        this.add()
        this.draw()
      })
      .onMove(({ marquee }) => {
        const { x, y } = this.viewportService.toRealStageXY(marquee)
        const { x: width, y: height } = this.viewportService.toRealStageShift({
          x: marquee.width,
          y: marquee.height,
        })
        if (this.type === 'ellipse') {
          this.node.x = x + width / 2
          this.node.y = y + height / 2
          this.node.width = width
          this.node.height = height
        } else {
          this.node.x = x
          this.node.y = y
          this.node.width = width
          this.node.height = height
        }
        this.draw()
      })
      .onEnd(({ dragService: drag }) => {
        if (!this.node.width) this.node.width = 100
        if (!this.node.height) this.node.height = 100
        this.draw()
        this.stageService.setInteractType('select')
        drag.endListen()
      })
  }
  endInteract() {}
  setType(type: ICreateType) {
    this.type = type
    this.stageService.setInteractType('create')
  }
  private createRect(realStageStart: IXY) {
    this._node = this.schemaDefaultService.rect({
      x: realStageStart.x,
      y: realStageStart.y,
      width: 0,
      height: 0,
    })
  }
  private createEllipse(realStageStart: IXY) {
    this._node = this.schemaDefaultService.ellipse({
      x: realStageStart.x,
      y: realStageStart.y,
      width: 0,
      height: 0,
    })
  }
  private add() {
    this.schemaNodeService.add(this.node)
    this.schemaNodeService.connect(this.node.id, this.schemaPageService.currentId, true)
  }
  private draw() {
    this.shapeDrawService.draw(this.node)
  }
}
