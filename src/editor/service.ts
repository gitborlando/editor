import { reaction } from 'mobx'
import { EE } from '~/helper/event-emitter'
import { DragService } from './drag'
import { EditorService } from './editor'
import { FileService } from './file'
import { SchemaDefaultService } from './schema/default'
import { SchemaNodeService } from './schema/node'
import { SchemaPageService } from './schema/page'
import { SchemaService } from './schema/schema'
import { StageInteractCreateService } from './stage/interact/create'
import { StageInteractDragStageService } from './stage/interact/drag-stage'
import { StageInteractSelectService } from './stage/interact/select'
import { PixiService } from './stage/pixi'
import { StageShapeDrawService } from './stage/shape/draw'
import { StageShapeService } from './stage/shape/shape'
import { StageService } from './stage/stage'
import { ViewportService } from './stage/viewport'
import { lazyInject } from './utils'

const schemaDefaultService = new SchemaDefaultService()
const schemaNodeService = new SchemaNodeService(undefined as any)
const schemaPageService = new SchemaPageService(schemaDefaultService, schemaNodeService)
lazyInject(schemaNodeService, 'schemaPageService', schemaPageService)
const schemaService = new SchemaService(schemaNodeService, schemaPageService)

const pixiService = new PixiService()
const dragService = new DragService(pixiService)

const viewportService = new ViewportService(pixiService)

const stageService = new StageService(pixiService)

const selectService = new StageInteractSelectService(pixiService, dragService, schemaNodeService)
const dragStageService = new StageInteractDragStageService(
  pixiService,
  dragService,
  viewportService
)

const shapeService = new StageShapeService(pixiService)
const drawService = new StageShapeDrawService(pixiService, shapeService, selectService)

const createShapeService = new StageInteractCreateService(
  dragService,
  stageService,
  schemaDefaultService,
  schemaNodeService,
  schemaPageService,
  drawService,
  viewportService
)

const editorService = new EditorService(
  schemaPageService,
  schemaNodeService,
  shapeService,
  drawService
)

const fileService = new FileService(
  schemaService,
  editorService,
  schemaPageService,
  schemaDefaultService
)

export type IServiceMap = typeof serviceMap
export const serviceMap = {
  schemaDefaultService,
  schemaNodeService,
  schemaPageService,
  schemaService,

  pixiService,
  dragService,

  viewportService,

  selectService,
  dragStageService,

  shapeService,
  drawService,

  createShapeService,

  stageService,
  editorService,
  fileService,
}

EE.on('pixi-stage-initialized', () => {
  fileService.mockFile()
  reaction(
    () => schemaPageService.currentId,
    (selectedPageId) => editorService.renderPage(selectedPageId),
    { fireImmediately: true }
  )
})
