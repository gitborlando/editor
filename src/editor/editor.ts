import { when } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { autobind, runInAction } from '~/editor/utility/decorator'
import { FileService, injectFile } from './file'
import { SchemaNodeService, injectSchemaNode } from './schema/node'
import { SchemaPageService, injectSchemaPage } from './schema/page'
import { PixiService, injectPixi } from './stage/pixi'
import { StageDrawService, injectStageDraw } from './stage/shape/draw'
import { StageShapeService, injectStageShape } from './stage/shape/shape'
import { watch } from './utility/utils'

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
      watch(() => this.schemaPageService.currentId).then(() => {
        this.makePageAllNodesDirty(this.schemaPageService.currentId)
      })
      this.drawDirtyNodesInEveryPixiTick()
    })
  }
  @runInAction makePageAllNodesDirty(pageId: string) {
    this.stageShapeService.clearAll()
    const nodeIds = this.schemaPageService.find(pageId)!.childIds
    nodeIds.forEach(this.schemaNodeService.collectDirtyNode)
  }
  private drawDirtyNodesInEveryPixiTick() {
    this.schemaNodeService.onFlushDirtyNode((id) =>
      this.stageDrawService.draw(this.schemaNodeService.find(id))
    )
    this.pixiService.app.ticker.add(this.schemaNodeService.flushDirtyNode)
  }
}

export const injectEditor = inject(EditorService)
