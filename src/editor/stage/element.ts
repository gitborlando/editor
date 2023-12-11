import { inject, injectable } from 'tsyringe'
import { autobind } from '~/shared/decorator'
import { SchemaNodeService, injectSchemaNode } from '../schema/node'
import { PIXI, PixiService, injectPixi } from './pixi'

export type IStageElement = PIXI.Graphics | PIXI.Text

@autobind
@injectable()
export class StageElementService {
  private elementMap: Map<string, IStageElement> = new Map()
  constructor(
    @injectPixi private Pixi: PixiService,
    @injectSchemaNode private SchemaNode: SchemaNodeService
  ) {}
  add(id: string, element: IStageElement) {
    this.elementMap.set(id, element)
    this.setupElement(id, element)
  }
  delete(id: string) {
    this.elementMap.delete(id)
  }
  find(id: string) {
    return this.elementMap.get(id)
  }
  clearAll() {
    this.Pixi.stage.removeChildren()
    this.elementMap = new Map()
  }
  private setupElement(id: string, element: IStageElement) {
    const { parentId } = this.SchemaNode.find(id)
    if (!element.parent) {
      const parent = this.find(parentId) || this.Pixi.stage
      element.setParent(parent)
    }
    element.eventMode = 'dynamic'
    element.on('mouseenter', () => this.SchemaNode.hover(id))
    element.on('mouseleave', () => this.SchemaNode.unHover(id))
  }
}

export const injectStageElement = inject(StageElementService)
