import { inject, injectable } from 'tsyringe'
import { auto, autobind } from '~/helper/decorator'
import { EE } from '~/helper/event-emitter'
import { watchChange } from '~/helper/utils'
import { FileService, injectFile } from './file'
import { SchemaNodeService, injectSchemaNode } from './schema/node'
import { SchemaPageService, injectSchemaPage } from './schema/page'
import { StageDrawService, injectStageDraw } from './stage/shape/draw'
import { StageShapeService, injectStageShape } from './stage/shape/shape'
import { ViewportService, injectViewport } from './stage/viewport'

@autobind
@injectable()
export class EditorService {
  constructor(
    @injectSchemaPage private schemaPageService: SchemaPageService,
    @injectSchemaNode private schemaNodeService: SchemaNodeService,
    @injectStageShape private stageShapeService: StageShapeService,
    @injectStageDraw private stageDrawService: StageDrawService,
    @injectViewport private viewportService: ViewportService,
    @injectFile private fileService: FileService
  ) {
    EE.on('pixi-stage-initialized', () => {
      this.fileService.mockFile()
      watchChange(() => this.schemaPageService.currentId).then(() =>
        this.renderPage(this.schemaPageService.currentId)
      )
    })
  }
  renderPage(pageId: string) {
    pageId = pageId || this.schemaPageService.pages[0].id
    const page = this.schemaPageService.find(pageId)!
    const nodes = page.childIds.map((childId) => this.schemaNodeService.nodeMap[childId])
    this.stageShapeService.clearAll()
    this.viewportService.setZoom(page.zoom)
    // console.log(page.zoom)
    nodes.forEach((node) => this.schemaNodeService.collectDirty(node.id))
    this.drawDirtyNodes()
  }
  @auto private drawDirtyNodes() {
    let id: string | undefined
    while (this.schemaNodeService.dirtyIds.length) {
      id = this.schemaNodeService.dirtyIds.pop()
      id && this.stageDrawService.draw(this.schemaNodeService.find(id))
    }
  }
}

export const injectEditor = inject(EditorService)
