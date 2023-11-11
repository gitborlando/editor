import Konva from 'konva'
import { autorun, reaction } from 'mobx'
import { randomColor } from '~/helper/utils'
import { SchemaService } from '../schema/schema'
import { INode } from '../schema/type'
import { StageService } from '../stage/stage'
import { DragService } from './drag'
import { FileService } from './file'

export class EditorService {
  Stage: StageService
  Schema: SchemaService
  Drag: DragService
  file: FileService
  constructor() {
    this.Stage = new StageService(this)
    this.Schema = new SchemaService(this)
    this.Drag = new DragService(this)
    this.file = new FileService(this)
    this.Stage.onLoad(() => {
      this.file.mockFile(mockFileJson)
      reaction(
        () => this.Schema.selectedPageId,
        (selectedPageId) => this.renderPage(selectedPageId),
        { fireImmediately: true }
      )
    })
  }
  renderPage(pageId?: string) {
    this.Stage.draw.clearAll()
    const page = this.Schema.findPage(pageId || this.Schema.pages[0].id)!
    const nodes = page.childIds.map((childId) => this.Schema.nodeMap[childId])
    nodes.forEach((node) => {
      const item = this.Stage.draw.rect()
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
      this.Stage.mainLayer.batchDraw()
    })
  }
}

export const Editor = new EditorService()

const mockFileJson = {
  id: 'mock1',
  nodes: {
    rect1: Editor.Schema.Default.rect({ id: 'rect1' }),
    rect2: Editor.Schema.Default.rect({ id: 'rect1', width: 200, height: 200, x: 200 }),
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
}
