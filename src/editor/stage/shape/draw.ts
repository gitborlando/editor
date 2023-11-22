import { INode, IRect, IVector } from '~/editor/schema/type'
import { autoBind } from '~/helper/decorator'
import { StageInteractSelectService } from '../interact/select'
import { PIXI, PixiService } from '../pixi'
import { StageShapeService } from './shape'

type IPixiShape = PIXI.Graphics | PIXI.Text

@autoBind
export class StageShapeDrawService {
  constructor(
    private pixiService: PixiService,
    private shapeService: StageShapeService,
    private selectService: StageInteractSelectService
  ) {}
  drawNodes(nodes: INode[]) {
    nodes.forEach((node) => this.draw(node))
  }
  draw(node: INode) {
    if (node.type === 'vector') {
      if (node.vectorType === 'rect') this.drawRect(node)
    }
  }
  drawRect(node: IRect) {
    const { x, y, width, height, id, parentId, fill } = node
    const shape = (this.shapeService.find(id) as PIXI.Graphics) || new PIXI.Graphics()
    shape.clear()
    shape.beginFill(fill)
    shape.lineStyle(1, 'green')
    shape.drawRect(x, y, width, height)
    this.initializeShape(shape, id, parentId)
  }
  private initializeShape(shape: IPixiShape, id: string, parentId: string) {
    if (!shape.parent) {
      const parent = this.shapeService.find(parentId) || this.pixiService.stage
      shape.setParent(parent)
    }
    if (!this.shapeService.find(id)) {
      this.shapeService.add(id, shape)
      shape.eventMode = 'dynamic'
      shape.on('mouseenter', () => this.selectService.setHoverId(id))
      shape.on('mouseleave', () => this.selectService.setHoverId(''))
    }
  }
  private drawPath(node: IVector) {}
}
