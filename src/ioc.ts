import 'reflect-metadata'
import { container } from 'tsyringe'
import { EditorService } from './editor/editor'
import { FileService } from './editor/file'
import { SchemaDefaultService } from './editor/schema/default'
import { SchemaNodeService } from './editor/schema/node'
import { SchemaPageService } from './editor/schema/page'
import { SchemaService } from './editor/schema/schema'
import { StageDrawService } from './editor/stage/draw/draw'
import { StageWidgetHoverService } from './editor/stage/draw/widget/hover'
import { StageWidgetMarqueeService } from './editor/stage/draw/widget/marquee'
import { StageWidgetTransformService } from './editor/stage/draw/widget/transform'
import { StageElementService } from './editor/stage/element'
import { StageCreateService } from './editor/stage/interact/create'
import { StageInteractService } from './editor/stage/interact/interact'
import { StageMoveService } from './editor/stage/interact/move'
import { StageSelectService } from './editor/stage/interact/select'
import { StageTransformService } from './editor/stage/interact/transform'
import { PixiService } from './editor/stage/pixi'
import { StageViewportService } from './editor/stage/viewport'
import { DragService } from './editor/utility/drag'
import { StatusService } from './editor/utility/status'
import { MenuService } from './global/menu'
import { SettingService } from './global/setting'

container // schema
  .registerSingleton(SchemaDefaultService)
  .registerSingleton(SchemaNodeService)
  .registerSingleton(SchemaPageService)
  .registerSingleton(SchemaService)
container // stage interact
  .registerSingleton(StageInteractService)
  .registerSingleton(StageSelectService)
  .registerSingleton(StageMoveService)
  .registerSingleton(StageCreateService)
  .registerSingleton(StageTransformService)
container // stage
  .registerSingleton(DragService)
  .registerSingleton(PixiService)
  .registerSingleton(StageViewportService)
  .registerSingleton(StageDrawService)
  .registerSingleton(StageElementService)
container // stage widget
  .registerSingleton(StageWidgetHoverService)
  .registerSingleton(StageWidgetMarqueeService)
  .registerSingleton(StageWidgetTransformService)
container // other
  .registerSingleton(StatusService)
  .registerSingleton(EditorService)
  .registerSingleton(FileService)

// global
container.registerSingleton(MenuService).registerSingleton(SettingService)

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
  StageTransform: container.resolve(StageTransformService),
  StageDraw: container.resolve(StageDrawService),
  StageShape: container.resolve(StageElementService),
  StageInteract: container.resolve(StageInteractService),
  Status: container.resolve(StatusService),
  Editor: container.resolve(EditorService),
  File: container.resolve(FileService),
}
container.resolve(StageWidgetHoverService)
container.resolve(StageWidgetMarqueeService)
container.resolve(StageWidgetTransformService)

export const globalServices = {
  Menu: container.resolve(MenuService),
  Setting: container.resolve(SettingService),
}
