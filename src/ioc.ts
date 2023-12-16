import 'reflect-metadata'
import { container } from 'tsyringe'
import { EditorService } from './editor/editor'
import { FileService } from './editor/file'
import { OperateGeometryService } from './editor/operate/geometry'
import { OperateService } from './editor/operate/operate'
import { SchemaDefaultService } from './editor/schema/default'
import { SchemaNodeService } from './editor/schema/node'
import { SchemaPageService } from './editor/schema/page'
import { SchemaService } from './editor/schema/schema'
import { StageDrawService } from './editor/stage/draw/draw'
import { StageDrawPathService } from './editor/stage/draw/path'
import { StageElementService } from './editor/stage/element'
import { StageCreateService } from './editor/stage/interact/create'
import { StageInteractService } from './editor/stage/interact/interact'
import { StageMoveService } from './editor/stage/interact/move'
import { StageSelectService } from './editor/stage/interact/select'
import { StageTransformService } from './editor/stage/interact/transform'
import { PixiService } from './editor/stage/pixi'
import { StageViewportService } from './editor/stage/viewport'
import { StageWidgetHoverService } from './editor/stage/widget/hover'
import { StageWidgetMarqueeService } from './editor/stage/widget/marquee'
import { StageWidgetRulerService } from './editor/stage/widget/ruler'
import { StageWidgetTransformService } from './editor/stage/widget/transform'
import { DragService } from './global/drag'
import { MenuService } from './global/menu'
import { SettingService } from './global/setting'
import { createHooker } from './shared/hooker'

export const iocEditorHooker = createHooker<[typeof editorServices]>()

container // schema
  .registerSingleton(SchemaDefaultService)
  .registerSingleton(SchemaNodeService)
  .registerSingleton(SchemaPageService)
  .registerSingleton(SchemaService)
container // operate
  .registerSingleton(OperateGeometryService)
  .registerSingleton(OperateService)
container // stage interact
  .registerSingleton(StageInteractService)
  .registerSingleton(StageSelectService)
  .registerSingleton(StageMoveService)
  .registerSingleton(StageCreateService)
  .registerSingleton(StageTransformService)
container // stage
  .registerSingleton(PixiService)
  .registerSingleton(StageViewportService)
  .registerSingleton(StageDrawService)
  .registerSingleton(StageElementService)
  .registerSingleton(StageDrawPathService)
container // stage widget
  .registerSingleton(StageWidgetHoverService)
  .registerSingleton(StageWidgetMarqueeService)
  .registerSingleton(StageWidgetTransformService)
  .registerSingleton(StageWidgetRulerService)
container // other
  .registerSingleton(EditorService)
  .registerSingleton(FileService)

// global
container
  .registerSingleton(DragService)
  .registerSingleton(MenuService)
  .registerSingleton(SettingService)

export const editorServices = {
  SchemaDefault: container.resolve(SchemaDefaultService),
  SchemaNode: container.resolve(SchemaNodeService),
  SchemaPage: container.resolve(SchemaPageService),
  Schema: container.resolve(SchemaService),
  OperateGeometry: container.resolve(OperateGeometryService),
  Operate: container.resolve(OperateService),
  Pixi: container.resolve(PixiService),
  StageViewport: container.resolve(StageViewportService),
  StageSelect: container.resolve(StageSelectService),
  StageMove: container.resolve(StageMoveService),
  StageCreate: container.resolve(StageCreateService),
  StageTransform: container.resolve(StageTransformService),
  StageDraw: container.resolve(StageDrawService),
  StageShape: container.resolve(StageElementService),
  StageInteract: container.resolve(StageInteractService),
  Editor: container.resolve(EditorService),
  File: container.resolve(FileService),
}
container.resolve(StageDrawPathService)
container.resolve(StageWidgetHoverService)
container.resolve(StageWidgetMarqueeService)
container.resolve(StageWidgetTransformService)
container.resolve(StageWidgetRulerService)

export const globalServices = {
  Drag: container.resolve(DragService),
  Menu: container.resolve(MenuService),
  Setting: container.resolve(SettingService),
}

iocEditorHooker.dispatch(editorServices)
