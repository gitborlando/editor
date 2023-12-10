import 'reflect-metadata'
import { container } from 'tsyringe'
import { EditorService } from './editor'
import { FileService } from './file'
import { SchemaDefaultService } from './schema/default'
import { SchemaNodeService } from './schema/node'
import { SchemaPageService } from './schema/page'
import { SchemaService } from './schema/schema'
import { StageCTXService } from './stage/draw/ctx/ctx'
import { StageDrawService } from './stage/draw/draw'
import { StageWidgetHoverService } from './stage/draw/widget/hover'
import { StageWidgetMarqueeService } from './stage/draw/widget/marquee'
import { StageWidgetTransformerService } from './stage/draw/widget/transformer'
import { StageElementService } from './stage/element'
import { StageCreateService } from './stage/interact/create'
import { StageInteractService } from './stage/interact/interact'
import { StageMoveService } from './stage/interact/move'
import { StageSelectService } from './stage/interact/select'
import { PixiService } from './stage/pixi'
import { StageViewportService } from './stage/viewport'
import { DragService } from './utility/drag'
import { MenuService } from './utility/menu'
import { SettingService } from './utility/setting'

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
container.registerSingleton(StageWidgetHoverService)
container.registerSingleton(StageWidgetMarqueeService)
container.registerSingleton(StageWidgetTransformerService)
container.registerSingleton(MenuService)
container.registerSingleton(SettingService)
container.registerSingleton(EditorService)
container.registerSingleton(FileService)

container.resolve(StageWidgetHoverService)
container.resolve(StageWidgetMarqueeService)
container.resolve(StageWidgetTransformerService)

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
  Menu: container.resolve(MenuService),
  Setting: container.resolve(SettingService),
  Editor: container.resolve(EditorService),
  File: container.resolve(FileService),
}
