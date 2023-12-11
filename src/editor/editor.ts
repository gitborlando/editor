import { runInAction, when } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { Watch, autobind } from '~/shared/decorator'
import { FileService, injectFile } from './file'
import { SchemaNodeService, injectSchemaNode } from './schema/node'
import { SchemaPageService, injectSchemaPage } from './schema/page'
import { StageDrawService, injectStageDraw } from './stage/draw/draw'
import { StageElementService, injectStageElement } from './stage/element'
import { PixiService, injectPixi } from './stage/pixi'
import { StatusService, injectStatus } from './utility/status'

@autobind
@injectable()
export class EditorService {
  pageAllNodeCount = 0
  constructor(
    @injectPixi private Pixi: PixiService,
    @injectSchemaPage private SchemaPage: SchemaPageService,
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectStageElement private StageElement: StageElementService,
    @injectStageDraw private StageDraw: StageDrawService,
    @injectFile private File: FileService,
    @injectStatus private Status: StatusService
  ) {
    when(() => this.Pixi.initialized).then(() => {
      this.File.mockFile()
      this.autoClearStage()
      this.autoMakeNodesDirty()
      this.drawDirtyInPixiTick()
    })
  }
  @Watch('SchemaPage.currentId')
  private autoClearStage() {
    this.Status.enter('pageFirstRender')
    this.StageElement.clearAll()
  }
  @Watch('SchemaPage.currentId')
  private autoMakeNodesDirty() {
    const nodeIds = this.SchemaPage.find(this.SchemaPage.currentId)!.childIds
    runInAction(() => nodeIds.forEach(this.SchemaNode.collectDirty))
    this.pageAllNodeCount = nodeIds.length
  }
  private drawDirtyInPixiTick() {
    this.SchemaNode.onFlushDirty((id) => {
      this.StageDraw.drawNode(this.SchemaNode.find(id))
      if (!this.StageElement.find(id)) {
        this.StageElement.add(id, this.StageDraw.currentElement)
      }
    })
  }
}

export const injectEditor = inject(EditorService)
