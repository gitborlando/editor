import { auto, autoBind } from '~/helper/decorator'
import { SchemaNodeService } from './schema/node'
import { SchemaPageService } from './schema/page'
import { StageShapeDrawService } from './stage/shape/draw'
import { StageShapeService } from './stage/shape/shape'

@autoBind
export class EditorService {
  constructor(
    private schemaPageService: SchemaPageService,
    private schemaNodeService: SchemaNodeService,
    private stageShapeService: StageShapeService,
    private stageShapeDrawService: StageShapeDrawService
  ) {}
  renderPage(pageId?: string) {
    this.stageShapeService.clearAll()
    const page = this.schemaPageService.find(pageId || this.schemaPageService.pages[0].id)!
    const nodes = page.childIds.map((childId) => this.schemaNodeService.nodeMap[childId])
    nodes.forEach((node) => this.schemaNodeService.collectDirty(node.id))
    this.drawDirtyNodes()
  }
  @auto private drawDirtyNodes() {
    let id: string | undefined
    while (this.schemaNodeService.dirtyIds.length) {
      id = this.schemaNodeService.dirtyIds.pop()
      id && this.stageShapeDrawService.draw(this.schemaNodeService.find(id))
    }
  }
}
