import { delay, inject, injectable } from 'tsyringe'
import { INode, IRect, IVector } from '~/editor/schema/type'
import { autobind } from '~/helper/decorator'
import { StageSelectService, injectStageSelect } from '../interact/select'
import { PIXI, PixiService, injectPixi } from '../pixi'
import { StageShapeService, injectStageShape } from './shape'

type IPixiShape = PIXI.Graphics | PIXI.Text

@autobind
@injectable()
export class StageDrawService {
  constructor(
    @injectPixi private pixiService: PixiService,
    @injectStageShape private shapeService: StageShapeService,
    @injectStageSelect private selectService: StageSelectService
  ) {}
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

export const injectStageDraw = inject(StageDrawService)
export const delayInjectStageDraw = inject(delay(() => StageDrawService))
