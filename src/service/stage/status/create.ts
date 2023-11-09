import Konva from 'konva'
import { IPoint } from '~/helper/utils'
import { EditorService } from '~/service/editor/editor'
import { ISchema } from '~/service/schema/type'
import { StageService } from '../stage'
import { StageStatus } from './status'

export class StageStatusCreate {
  private _schema?: ISchema
  private _item?: Konva.Shape
  constructor(
    private status: StageStatus,
    private stage: StageService,
    private editor: EditorService
  ) {}
  private get schema(): ISchema {
    return this._schema!
  }
  private get item(): Konva.Shape {
    return this._item!
  }
  start() {
    this.editor.Drag.onStart(({ absoluteStart }) => {
      if (this.status.createType === 'frame') this.createRect(absoluteStart)
      if (this.status.createType === 'rect') this.createRect(absoluteStart)
      if (this.status.createType === 'ellipse') this.createEllipse(absoluteStart)
      if (this.status.createType === 'line') this.createRect(absoluteStart)
      if (this.status.createType === 'text') this.createRect(absoluteStart)
      if (this.status.createType === 'img') this.createRect(absoluteStart)
    })
      .onMove(({ absoluteMarquee: { x, y, width, height } }) => {
        if (this.status.createType === 'ellipse') {
          this.schema.x = x + width / 2
          this.schema.y = y + height / 2
          this.schema.width = width
          this.schema.height = height
        } else {
          this.schema.x = x
          this.schema.y = y
          this.schema.width = width
          this.schema.height = height
        }
      })
      .onEnd(({ drag }) => {
        this.stage.setStatus()
        drag.destroy()
      })
  }
  end() {}
  private createRect(absoluteStart: IPoint) {
    this._schema = this.editor.Schema.Default.rect({
      x: absoluteStart.x,
      y: absoluteStart.y,
      width: 0,
      height: 0,
    })
    this._item = new Konva.Rect()
    this.add()
  }
  private createEllipse(absoluteStart: IPoint) {
    this._schema = this.editor.Schema.Default.ellipse({
      x: absoluteStart.x,
      y: absoluteStart.y,
      width: 0,
      height: 0,
    })
    this._item = new Konva.Ellipse()
    this.add()
  }
  private add() {
    this.editor.Schema.addSchema(this.schema)
    this.editor.autoSchemaToItem(this.schema, this.item)
    this.stage.mainLayer.add(this.item)
    this.stage.transformer.nodes([this.item])
  }
}
