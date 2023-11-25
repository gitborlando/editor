import { when } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { auto, autobind } from '~/helper/decorator'
import { watch } from '~/helper/utils'
import { FileService, injectFile } from './file'
import { SchemaNodeService, injectSchemaNode } from './schema/node'
import { SchemaPageService, injectSchemaPage } from './schema/page'
import { PixiService, injectPixi } from './stage/pixi'
import { StageDrawService, injectStageDraw } from './stage/shape/draw'
import { StageShapeService, injectStageShape } from './stage/shape/shape'

@autobind
@injectable()
export class EditorService {
  constructor(
    @injectPixi private pixiService: PixiService,
    @injectSchemaPage private schemaPageService: SchemaPageService,
    @injectSchemaNode private schemaNodeService: SchemaNodeService,
    @injectStageShape private stageShapeService: StageShapeService,
    @injectStageDraw private stageDrawService: StageDrawService,
    @injectFile private fileService: FileService
  ) {}
  initialize() {
    when(() => this.pixiService.initialized).then(() => {
      this.fileService.mockFile()
      watch(() => this.schemaPageService.currentId).then(() =>
        this.renderPage(this.schemaPageService.currentId)
      )
    })
  }
  renderPage(pageId: string) {
    this.stageShapeService.clearAll()
    const nodeIds = this.schemaPageService.find(pageId)!.childIds
    nodeIds.forEach(this.schemaNodeService.collectDirty)
    this.autoDrawDirtyNodes()
  }
  @auto private autoDrawDirtyNodes() {
    while (this.schemaNodeService.dirtyIds.length) {
      let id = this.schemaNodeService.dirtyIds.pop()
      id && this.stageDrawService.draw(this.schemaNodeService.find(id))
    }
  }
}

export const injectEditor = inject(EditorService)