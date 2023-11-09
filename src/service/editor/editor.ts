import autoBind from 'auto-bind'
import Konva from 'konva'
import { autorun, makeAutoObservable } from 'mobx'
import { randomColor } from '~/helper/utils'
import { SchemaService } from '../schema/schema'
import { ISchema } from '../schema/type'
import { StageService } from '../stage/stage'
import { DragService } from './drag'

export class EditorService {
  Stage: StageService
  Schema: SchemaService
  Drag: DragService
  public constructor() {
    autoBind(this)
    makeAutoObservable(this)
    this.Schema = new SchemaService(this)
    this.Stage = new StageService(this)
    this.Drag = new DragService(this)
  }
  autoSchemaToItem(schema: ISchema, item: Konva.Shape) {
    this.autoUpdate(() => item.id(schema.id))
    this.autoUpdate(() => item.x(schema.x))
    this.autoUpdate(() => item.y(schema.y))
    this.autoUpdate(() => item.width(schema.width))
    this.autoUpdate(() => item.height(schema.height))
    this.autoUpdate(() => item.rotation(schema.rotation))
    this.autoUpdate(() => item.opacity(schema.opacity))
    this.autoUpdate(() => item.visible(schema.visible))
    //this.autoUpdate(() => item.draggable(!schema.lock))
    this.autoUpdate(() => item.fill(randomColor()))
  }
  private autoUpdate(updateFunc: () => void) {
    autorun(() => {
      updateFunc()
      this.Stage.mainLayer.batchDraw()
    })
  }
}

export const Editor = new EditorService()
