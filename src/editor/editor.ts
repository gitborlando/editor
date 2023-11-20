import Konva from 'konva'
import { autorun, reaction } from 'mobx'
import { EE } from '~/helper/event-emitter'
import { DragService } from './drag'
import { SchemaService } from './schema/schema'
import { INode } from './schema/type'
import { StageService } from './stage/stage'

export class EditorService {
  schema: SchemaService
  stage: StageService
  drag: DragService

  constructor() {
    this.schema = new SchemaService(this)
    this.stage = new StageService(this)
    this.drag = new DragService(this)
    EE.on('stage-instance-exist', () => {
      this.schema.file.mockFile()
      reaction(
        () => this.schema.page.currentId,
        (selectedPageId) => this.renderPage(selectedPageId),
        { fireImmediately: true }
      )
    })
  }
  renderPage(pageId?: string) {
    this.stage.draw.clearAll()
    const page = this.schema.page.find(pageId || this.schema.page.pages[0].id)!
    const nodes = page.childIds.map((childId) => this.schema.node.map[childId])
    nodes.forEach((node) => {
      if (node.type !== 'vector') return
      const item =
        node.vectorType === 'ellipse' ? this.stage.draw.ellipse() : this.stage.draw.rect()
      this.autoSchemaToItem(node, item)
    })
  }
  autoSchemaToItem(node: INode, item: Konva.Shape) {
    this.autoUpdate(() => item.id(node.id))
    this.autoUpdate(() => item.x(node.x))
    this.autoUpdate(() => item.y(node.y))
    this.autoUpdate(() => item.width(node.width))
    this.autoUpdate(() => item.height(node.height))
    this.autoUpdate(() => item.rotation(node.rotation))
    this.autoUpdate(() => item.opacity(node.opacity))
    this.autoUpdate(() => item.visible(node.visible))
    //this.autoUpdate(() => item.draggable(!schema.lock))
    //  this.autoUpdate(() => item.opacity(node.opacity))
    // this.autoUpdate(() => item.fill(randomColor()))
    this.autoUpdate(() => item.fill('skyblue'))
  }
  private autoUpdate(updateFunc: () => void) {
    autorun(() => {
      updateFunc()
      this.stage.mainLayer.batchDraw()
    })
  }
}
