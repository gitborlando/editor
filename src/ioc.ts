import 'reflect-metadata'
import { container } from 'tsyringe'
import { EditorService } from './editor/editor'
import { FileService } from './editor/file'
import { SchemaDefaultService } from './editor/schema/default'
import { SchemaNodeService } from './editor/schema/node'
import { SchemaPageService } from './editor/schema/page'
import { SchemaService } from './editor/schema/schema'
import { StageCTXService } from './editor/stage/draw/ctx/ctx'
import { StageDrawService } from './editor/stage/draw/draw'
import { StageWidgetHoverService } from './editor/stage/draw/widget/hover'
import { StageWidgetMarqueeService } from './editor/stage/draw/widget/marquee'
import { StageWidgetTransformerService } from './editor/stage/draw/widget/transformer'
import { StageElementService } from './editor/stage/element'
import { StageCreateService } from './editor/stage/interact/create'
import { StageInteractService } from './editor/stage/interact/interact'
import { StageMoveService } from './editor/stage/interact/move'
import { StageSelectService } from './editor/stage/interact/select'
import { PixiService } from './editor/stage/pixi'
import { StageViewportService } from './editor/stage/viewport'
import { DragService } from './editor/utility/drag'
import { SettingService } from './editor/utility/setting'
import { StatusService } from './editor/utility/status'
import { MenuService } from './global/menu'

container
  .registerSingleton(SchemaDefaultService)
  .registerSingleton(SchemaNodeService)
  .registerSingleton(SchemaPageService)
  .registerSingleton(SchemaService)
  .registerSingleton(DragService)
  .registerSingleton(PixiService)
  .registerSingleton(StageViewportService)
  .registerSingleton(StageSelectService)
  .registerSingleton(StageMoveService)
  .registerSingleton(StageCreateService)
  .registerSingleton(StageCTXService)
  .registerSingleton(StageDrawService)
  .registerSingleton(StageElementService)
  .registerSingleton(StageInteractService)
  .registerSingleton(StageWidgetHoverService)
  .registerSingleton(StageWidgetMarqueeService)
  .registerSingleton(StageWidgetTransformerService)
  .registerSingleton(SettingService)
  .registerSingleton(StatusService)
  .registerSingleton(EditorService)
  .registerSingleton(FileService)

container.registerSingleton(MenuService)

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
  Setting: container.resolve(SettingService),
  Status: container.resolve(StatusService),
  Editor: container.resolve(EditorService),
  File: container.resolve(FileService),
}
container.resolve(StageWidgetHoverService)
container.resolve(StageWidgetMarqueeService)
container.resolve(StageWidgetTransformerService)

export const globalServices = {
  Menu: container.resolve(MenuService),
}
