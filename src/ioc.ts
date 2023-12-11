import 'reflect-metadata'
import { container as Container } from 'tsyringe'
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
import { MenuService } from './editor/utility/menu'
import { SettingService } from './editor/utility/setting'
import { StatusService } from './editor/utility/status'

const editorContainer = Container.createChildContainer()

editorContainer
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
  .registerSingleton(MenuService)
  .registerSingleton(SettingService)
  .registerSingleton(StatusService)
  .registerSingleton(EditorService)
  .registerSingleton(FileService)

editorContainer.resolve(StageWidgetHoverService)
editorContainer.resolve(StageWidgetMarqueeService)
editorContainer.resolve(StageWidgetTransformerService)

export const editorServices = {
  SchemaDefault: editorContainer.resolve(SchemaDefaultService),
  SchemaNode: editorContainer.resolve(SchemaNodeService),
  SchemaPage: editorContainer.resolve(SchemaPageService),
  Schema: editorContainer.resolve(SchemaService),
  Drag: editorContainer.resolve(DragService),
  Pixi: editorContainer.resolve(PixiService),
  StageViewport: editorContainer.resolve(StageViewportService),
  StageSelect: editorContainer.resolve(StageSelectService),
  StageMove: editorContainer.resolve(StageMoveService),
  StageCreate: editorContainer.resolve(StageCreateService),
  StageCTX: editorContainer.resolve(StageCTXService),
  StageDraw: editorContainer.resolve(StageDrawService),
  StageShape: editorContainer.resolve(StageElementService),
  StageInteract: editorContainer.resolve(StageInteractService),
  Menu: editorContainer.resolve(MenuService),
  Setting: editorContainer.resolve(SettingService),
  Status: editorContainer.resolve(StatusService),
  Editor: editorContainer.resolve(EditorService),
  File: editorContainer.resolve(FileService),
}
