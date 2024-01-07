import 'reflect-metadata'
import { container } from 'tsyringe'
import { EditorService } from './editor/editor'
import { OperateGeometryService } from './editor/operate/geometry'
import { SchemaDefaultService } from './editor/schema/default'
import { SchemaNodeService } from './editor/schema/node'
import { SchemaPageService } from './editor/schema/page'
import { SchemaService } from './editor/schema/schema'
import { SchemaUtilService } from './editor/schema/util'
import { StageCursorService } from './editor/stage/cursor'
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
import { StageWidgetGuideService } from './editor/stage/widget/guide'
import { StageWidgetHoverService } from './editor/stage/widget/hover'
import { StageWidgetMarqueeService } from './editor/stage/widget/marquee'
import { StageWidgetRulerService } from './editor/stage/widget/ruler'
import { StageWidgetTransformService } from './editor/stage/widget/transform'
import { UILeftPanelLayerService } from './editor/ui-state/left-panel/layer'
import { UILeftPanelService } from './editor/ui-state/left-panel/left-panel'
import { DragService } from './global/drag'
import { EventWheelService } from './global/event/wheel'
import { FileService } from './global/file'
import { MenuService } from './global/menu'
import { SettingService } from './global/setting'
import { createHooker } from './shared/hooker'

export const iocEditorHooker = createHooker<[typeof editorServices]>()

container // schema
  .registerSingleton(SchemaDefaultService)
  .registerSingleton(SchemaNodeService)
  .registerSingleton(SchemaPageService)
  .registerSingleton(SchemaService)
  .registerSingleton(SchemaUtilService)
container // operate
  .registerSingleton(OperateGeometryService)
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
  .registerSingleton(StageCursorService)
container // stage widget
  .registerSingleton(StageWidgetHoverService)
  .registerSingleton(StageWidgetMarqueeService)
  .registerSingleton(StageWidgetTransformService)
  .registerSingleton(StageWidgetGuideService)
  .registerSingleton(StageWidgetRulerService)
container // other
  .registerSingleton(EditorService)
container // ui
  .registerSingleton(UILeftPanelService)
  .registerSingleton(UILeftPanelLayerService)

// global
container
  .registerSingleton(FileService)
  .registerSingleton(DragService)
  .registerSingleton(MenuService)
  .registerSingleton(SettingService)
container // event
  .register(EventWheelService, { useClass: EventWheelService })

export const editorServices = {
  SchemaDefault: container.resolve(SchemaDefaultService),
  SchemaNode: container.resolve(SchemaNodeService),
  SchemaPage: container.resolve(SchemaPageService),
  SchemaUtil: container.resolve(SchemaUtilService),
  Schema: container.resolve(SchemaService),
  OperateGeometry: container.resolve(OperateGeometryService),
  Pixi: container.resolve(PixiService),
  StageViewport: container.resolve(StageViewportService),
  StageSelect: container.resolve(StageSelectService),
  StageMove: container.resolve(StageMoveService),
  StageCreate: container.resolve(StageCreateService),
  StageTransform: container.resolve(StageTransformService),
  StageDraw: container.resolve(StageDrawService),
  StageCursor: container.resolve(StageCursorService),
  StageShape: container.resolve(StageElementService),
  StageInteract: container.resolve(StageInteractService),
  Editor: container.resolve(EditorService),
  UILeftPanel: container.resolve(UILeftPanelService),
  UILeftPanelLayer: container.resolve(UILeftPanelLayerService),
}
container.resolve(StageDrawPathService)
container.resolve(StageWidgetHoverService)
container.resolve(StageWidgetMarqueeService)
container.resolve(StageWidgetTransformService)
container.resolve(StageWidgetGuideService)
container.resolve(StageWidgetRulerService)

export const globalServices = {
  File: container.resolve(FileService),
  Drag: container.resolve(DragService),
  EventWheel: container.resolve(EventWheelService),
  Menu: container.resolve(MenuService),
  Setting: container.resolve(SettingService),
}

iocEditorHooker.dispatch(editorServices)
