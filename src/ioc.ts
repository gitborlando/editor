import 'reflect-metadata'
import { container } from 'tsyringe'
import { DragService } from './editor/drag'
import { EditorService } from './editor/editor'
import { FileService } from './editor/file'
import { SchemaDefaultService } from './editor/schema/default'
import { SchemaNodeService } from './editor/schema/node'
import { SchemaPageService } from './editor/schema/page'
import { SchemaService } from './editor/schema/schema'
import { StageCreateService } from './editor/stage/interact/create'
import { StageMoveService } from './editor/stage/interact/move'
import { StageSelectService } from './editor/stage/interact/select'
import { PixiService } from './editor/stage/pixi'
import { StageService } from './editor/stage/stage'
import { ViewportService } from './editor/stage/viewport'

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
container.registerSingleton(StageService)
container.registerSingleton(EditorService)
container.registerSingleton(FileService)

export function useServices() {
  return {
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
    stageService: container.resolve(StageService),
    editorService: container.resolve(EditorService),
    fileService: container.resolve(FileService),
  }
}
