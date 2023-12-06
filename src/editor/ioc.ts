import 'reflect-metadata'
import { container } from 'tsyringe'
import { DragService } from './drag'
import { EditorService } from './editor'
import { FileService } from './file'
import { SchemaDefaultService } from './schema/default'
import { SchemaNodeService } from './schema/node'
import { SchemaPageService } from './schema/page'
import { SchemaService } from './schema/schema'
import { StageCTXService } from './stage/draw/ctx/ctx'
import { StageDrawService } from './stage/draw/draw'
import { StageElementService } from './stage/element'
import { StageCreateService } from './stage/interact/create'
import { StageInteractService } from './stage/interact/interact'
import { StageMoveService } from './stage/interact/move'
import { StageSelectService } from './stage/interact/select'
import { PixiService } from './stage/pixi'
import { StageViewportService } from './stage/viewport'

container.registerSingleton(SchemaDefaultService)
container.registerSingleton(SchemaNodeService)
container.registerSingleton(SchemaPageService)
container.registerSingleton(SchemaService)
container.registerSingleton(DragService)
container.registerSingleton(PixiService)
container.registerSingleton(StageViewportService)
container.registerSingleton(StageSelectService)
container.registerSingleton(StageMoveService)
container.registerSingleton(StageCreateService)
container.registerSingleton(StageCTXService)
container.registerSingleton(StageDrawService)
container.registerSingleton(StageElementService)
container.registerSingleton(StageInteractService)
container.registerSingleton(EditorService)
container.registerSingleton(FileService)

export const editorServices = {
  SchemaDefault: container.resolve(SchemaDefaultService),
  SchemaNode: container.resolve(SchemaNodeService),
  SchemaPage: container.resolve(SchemaPageService),
  Schema: container.resolve(SchemaService),
  Drag: container.resolve(DragService),
  Pixi: container.resolve(PixiService),
  StageViewport: container.resolve(StageViewportService),
  StageSelect: container.resolve(StageSelectService),
  StageMove: container.resolve(StageMoveService),
  StageCreate: container.resolve(StageCreateService),
  StageCTX: container.resolve(StageCTXService),
  StageDraw: container.resolve(StageDrawService),
  StageShape: container.resolve(StageElementService),
  StageInteract: container.resolve(StageInteractService),
  Editor: container.resolve(EditorService),
  File: container.resolve(FileService),
}
