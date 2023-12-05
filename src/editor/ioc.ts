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
import { ViewportService } from './stage/viewport'

container.registerSingleton(SchemaDefaultService)
container.registerSingleton(SchemaNodeService)
container.registerSingleton(SchemaPageService)
container.registerSingleton(SchemaService)
container.registerSingleton(DragService)
container.registerSingleton(PixiService)
container.registerSingleton(ViewportService)
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
  schemaDefaultService: container.resolve(SchemaDefaultService),
  schemaNodeService: container.resolve(SchemaNodeService),
  schemaPageService: container.resolve(SchemaPageService),
  schemaService: container.resolve(SchemaService),
  dragService: container.resolve(DragService),
  pixiService: container.resolve(PixiService),
  viewportService: container.resolve(ViewportService),
  stageSelectService: container.resolve(StageSelectService),
  stageMoveService: container.resolve(StageMoveService),
  stageCreateService: container.resolve(StageCreateService),
  stageCTXService: container.resolve(StageCTXService),
  stageDrawService: container.resolve(StageDrawService),
  stageShapeService: container.resolve(StageElementService),
  stageService: container.resolve(StageInteractService),
  editorService: container.resolve(EditorService),
  fileService: container.resolve(FileService),
}
