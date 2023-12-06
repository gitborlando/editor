import { runInAction, when } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { Watch, autobind } from '~/editor/utility/decorator'
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
    when(() => pixiService.initialized).then(() => {
      this.fileService.mockFile()
      this.autoClearStage()
      this.autoMakeNodesDirty()
      this.drawDirtyInPixiTick()
    })
  }
  @Watch('schemaPageService.currentId')
  private autoClearStage() {
    this.stageElementService.clearAll()
  }
  @Watch('schemaPageService.currentId')
  private autoMakeNodesDirty() {
    const nodeIds = this.schemaPageService.find(this.schemaPageService.currentId)!.childIds
    runInAction(() => nodeIds.forEach(this.schemaNodeService.collectDirty))
  }
  private drawDirtyInPixiTick() {
    this.schemaNodeService.onFlushDirty((id) => {
      this.stageDrawService.drawNode(this.schemaNodeService.find(id))
      if (!this.stageElementService.find(id)) {
        this.stageElementService.add(id, this.stageDrawService.currentElement)
      }
    })
    this.pixiService.app.ticker.add(this.schemaNodeService.flushDirty)
  }
}

export const injectEditor = inject(EditorService)
