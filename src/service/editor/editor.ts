import autoBind from 'auto-bind'
import Konva from 'konva'
import { autorun, makeAutoObservable } from 'mobx'
import { randomColor } from '~/helper/utils'
import { SchemaService } from '../schema/schema'
import { INode } from '../schema/type'
import { StageService } from '../stage/stage'
import { DragService } from './drag'

export class EditorService {
  Stage: StageService
  Schema: SchemaService
  Drag: DragService
  public constructor() {
    autoBind(this)
    makeAutoObservable(this)
    this.Schema = new SchemaService(this)
    this.Stage = new StageService(this)
    this.Drag = new DragService(this)
    this.openFile()
    window.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'l') this.exportFile()
    })
  }
  openFile() {
    const json = {
      nodes: {
        rect1: this.Schema.Default.rect({ id: 'rect1' }),
      },
      pages: [
        {
          id: 'page1',
          name: 'page1',
          childIds: ['rect1'],
        },
      ],
    }
    this.Schema.setSchema(json)
  }
  exportFile() {
    console.log(this.Schema.getSchema())
  }
  renderNodes(pageId?: string) {
    // if (!pageId) pageId = this.Schema.pages[0].id
    // const page = this.Schema.findPage(pageId) || this.Schema.pages[0]
    // const nodes = page.childIds.map((childId) => this.Schema.nodeMap[childId])
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
