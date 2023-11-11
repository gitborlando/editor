import Konva from 'konva'
import { autorun, reaction } from 'mobx'
import { randomColor } from '~/helper/utils'
import { SchemaService } from '../schema/schema'
import { INode } from '../schema/type'
import { StageService } from '../stage/stage'
import { DragService } from './drag'
import { FileService } from './file'

export class EditorService {
  stage: StageService
  schema: SchemaService
  drag: DragService
  file: FileService
  constructor() {
    this.stage = new StageService(this)
    this.schema = new SchemaService(this)
    this.drag = new DragService(this)
    this.file = new FileService(this)
    this.stage.onLoad(() => {
      this.file.mockFile(mockFileJson(this))
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
      const item = this.stage.draw.rect()
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
    this.autoUpdate(() => item.fill(randomColor()))
  }
  private autoUpdate(updateFunc: () => void) {
    autorun(() => {
      updateFunc()
      this.stage.mainLayer.batchDraw()
    })
  }
}

export const editor = new EditorService()

const mockFileJson = (editor: EditorService) => ({
  meta: { id: 'mock1', name: '测试文件1' },
  nodes: {
    rect1: editor.schema.default.rect({ id: 'rect1', parentId: 'page1' }),
    rect2: editor.schema.default.rect({
      id: 'rect1',
      width: 200,
      height: 200,
      x: 200,
      parentId: 'page2',
    }),
  },
  pages: [
    {
      id: 'page1',
      name: '测试页面1',
      childIds: ['rect1'],
    },
    {
      id: 'page2',
      name: '测试页面2',
      childIds: ['rect2'],
    },
  ],
})
