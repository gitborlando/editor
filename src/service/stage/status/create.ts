import Konva from 'konva'
import { IXY } from '~/helper/utils'
import { EditorService } from '~/service/editor/editor'
import { INode } from '~/service/schema/type'
import { StageService } from '../stage'
import { StageStatus } from './status'

export class StageStatusCreate {
  private _node?: INode
  private _item?: Konva.Shape
  constructor(
    private status: StageStatus,
    private stage: StageService,
    private editor: EditorService
  ) {}
  private get node(): INode {
    return this._node!
  }
  private get item(): Konva.Shape {
    return this._item!
  }
  start() {
    this.editor.Drag.onStart(({ absoluteStart }) => {
      if (this.status.createType === 'frame') this.createRect(absoluteStart)
      if (this.status.createType === 'rect') this.createRect(absoluteStart)
      if (this.status.createType === 'ellipse') this.createEllipse(absoluteStart)
      if (this.status.createType === 'line') this.createRect(absoluteStart)
      if (this.status.createType === 'text') this.createRect(absoluteStart)
      if (this.status.createType === 'img') this.createRect(absoluteStart)
    })
      .onMove(({ absoluteMarquee: { x, y, width, height } }) => {
        if (this.status.createType === 'ellipse') {
          this.node.x = x + width / 2
          this.node.y = y + height / 2
          this.node.width = width
          this.node.height = height
        } else {
          this.node.x = x
          this.node.y = y
          this.node.width = width
          this.node.height = height
        }
      })
      .onEnd(({ drag }) => {
        this.stage.setStatus()
        drag.destroy()
      })
  }
  end() {}
  private createRect(absoluteStart: IXY) {
    this._node = this.editor.Schema.Default.rect({
      x: absoluteStart.x,
      y: absoluteStart.y,
      width: 0,
      height: 0,
    })
    this._item = new Konva.Rect()
    this.add()
  }
  private createEllipse(absoluteStart: IXY) {
    this._node = this.editor.Schema.Default.ellipse({
      x: absoluteStart.x,
      y: absoluteStart.y,
      width: 0,
      height: 0,
    })
    this._item = new Konva.Ellipse()
    this.add()
  }
  private add() {
    this.editor.Schema.addNode(this.node)
    this.editor.autoSchemaToItem(this.node, this.item)
    this.stage.mainLayer.add(this.item)
    this.stage.transformer.nodes([this.item])
  }
}
