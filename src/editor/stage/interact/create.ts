import { inject, injectable } from 'tsyringe'
import { DragService, injectDrag } from '~/editor/drag'
import { SchemaDefaultService, injectSchemaDefault } from '~/editor/schema/default'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { SchemaPageService, injectSchemaPage } from '~/editor/schema/page'
import { INode } from '~/editor/schema/type'
import { IXY, runAsAction } from '~/editor/utils'
import { autobind } from '~/helper/decorator'
import { StageService, injectStage, listenInteractTypeChange } from '../stage'
import { ViewportService, injectViewport } from '../viewport'

const createTypes = ['frame', 'rect', 'ellipse', 'polygon', 'line', 'text', 'img'] as const
type ICreateType = typeof createTypes[number]

@autobind
@injectable()
export class StageCreateService {
  types = createTypes
  type: ICreateType = 'frame'
  private node!: INode
  constructor(
    @injectDrag private dragService: DragService,
    @injectStage private stageService: StageService,
    @injectSchemaDefault private schemaDefaultService: SchemaDefaultService,
    @injectSchemaNode private schemaNodeService: SchemaNodeService,
    @injectSchemaPage private schemaPageService: SchemaPageService,
    @injectViewport private viewportService: ViewportService
  ) {
    listenInteractTypeChange(this, 'create')
  }
  startInteract() {
    this.dragService
      .onStart(({ start, dragService }) => {
        if (!this.viewportService.inViewport(start)) {
          this.stageService.setInteractType('select')
          dragService.destroy()
          return
        }
        const realStageStart = this.viewportService.toRealStageXY(start)
        if (this.type === 'frame') this.createRect(realStageStart)
        if (this.type === 'rect') this.createRect(realStageStart)
        if (this.type === 'ellipse') this.createEllipse(realStageStart)
        if (this.type === 'line') this.createRect(realStageStart)
        if (this.type === 'text') this.createRect(realStageStart)
        if (this.type === 'img') this.createRect(realStageStart)
        this.addToSchemaAndObserveAndSelect()
      })
      .onMove(
        runAsAction(({ marquee }) => {
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
        })
      )
      .onEnd(
        runAsAction(({ dragService }) => {
          if (!this.node.width) this.node.width = 100
          if (!this.node.height) this.node.height = 100
          this.stageService.setInteractType('select')
          dragService.destroy()
        })
      )
  }
  endInteract() {}
  setType(type: ICreateType) {
    this.type = type
    this.stageService.setInteractType('create')
  }
  private createRect(realStageStart: IXY) {
    this.node = this.schemaDefaultService.rect({
      x: realStageStart.x,
      y: realStageStart.y,
      width: 0,
      height: 0,
    })
  }
  private createEllipse(realStageStart: IXY) {
    this.node = this.schemaDefaultService.ellipse({
      x: realStageStart.x,
      y: realStageStart.y,
      width: 0,
      height: 0,
    })
  }
  private addToSchemaAndObserveAndSelect() {
    this.node = this.schemaNodeService.add(this.node)
    this.schemaNodeService.clearSelection()
    this.schemaNodeService.select(this.node.id)
    this.schemaNodeService.connect(this.node.id, this.schemaPageService.currentId, true)
  }
}

export const injectStageCreate = inject(StageCreateService)
