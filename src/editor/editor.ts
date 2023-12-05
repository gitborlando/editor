import { runInAction, when } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { autobind, watch } from '~/editor/utility/decorator'
import { FileService, injectFile } from './file'
import { SchemaNodeService, injectSchemaNode } from './schema/node'
import { SchemaPageService, injectSchemaPage } from './schema/page'
import { StageDrawService, injectStageDraw } from './stage/draw/draw'
import { StageElementService, injectStageElement } from './stage/element'
import { PixiService, injectPixi } from './stage/pixi'

@autobind
@injectable()
export class EditorService {
  constructor(
    @injectPixi private pixiService: PixiService,
    @injectSchemaPage private schemaPageService: SchemaPageService,
    @injectSchemaNode private schemaNodeService: SchemaNodeService,
    @injectStageElement private stageElementService: StageElementService,
    @injectStageDraw private stageDrawService: StageDrawService,
    @injectFile private fileService: FileService
  ) {
    when(() => this.pixiService.initialized).then(() => {
      this.fileService.mockFile()
      this.autoClearStageElement()
      this.autoMakePageAllNodesDirty()
      this.drawDirtyNodesInEveryPixiTick()
    })
  }
  @watch('schemaPageService.currentId')
  private autoClearStageElement() {
    this.stageElementService.clearAll()
  }
  @watch('schemaPageService.currentId')
  private autoMakePageAllNodesDirty() {
    const nodeIds = this.schemaPageService.find(this.schemaPageService.currentId)!.childIds
    runInAction(() => nodeIds.forEach(this.schemaNodeService.collectDirtyNode))
  }
  private drawDirtyNodesInEveryPixiTick() {
    this.schemaNodeService.onFlushDirtyNode((id) =>
      this.stageDrawService.draw(this.schemaNodeService.find(id))
    )
    this.pixiService.app.ticker.add(this.schemaNodeService.flushDirtyNode)
  }
}

export const injectEditor = inject(EditorService)
