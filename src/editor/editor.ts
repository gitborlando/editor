import { runInAction } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { Watch, When, autobind } from '~/shared/decorator'
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
    @injectPixi private Pixi: PixiService,
    @injectSchemaPage private SchemaPage: SchemaPageService,
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectStageElement private StageElement: StageElementService,
    @injectStageDraw private StageDraw: StageDrawService,
    @injectFile private File: FileService
  ) {
    this.initialize()
  }
  @When('Pixi.initialized')
  private initialize() {
    this.File.mockFile()
    this.autoClearStage()
    this.autoMakeNodesDirty()
    this.drawDirtyInPixiTick()
  }
  @Watch('SchemaPage.currentId')
  private autoClearStage() {
    this.StageElement.clearAll()
  }
  @Watch('SchemaPage.currentId')
  private autoMakeNodesDirty() {
    const nodeIds = this.SchemaPage.find(this.SchemaPage.currentId)!.childIds
    runInAction(() => nodeIds.forEach(this.SchemaNode.collectDirty))
  }
  private drawDirtyInPixiTick() {
    this.SchemaNode.duringFlushDirty.hook((id) => {
      this.StageDraw.drawNode(this.SchemaNode.find(id))
    })
  }
}

export const injectEditor = inject(EditorService)
