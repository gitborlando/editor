import { inject, injectable } from 'tsyringe'
import { autobind } from '~/editor/utility/decorator'
import { SchemaNodeService, injectSchemaNode } from '../schema/node'
import { PIXI, PixiService, injectPixi } from './pixi'

export type IStageElement = PIXI.Graphics | PIXI.Text

@autobind
@injectable()
export class StageElementService {
  private elementMap: Map<string, IStageElement> = new Map()
  constructor(
    @injectPixi private pixiService: PixiService,
    @injectSchemaNode private schemaNodeService: SchemaNodeService
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
    this.pixiService.stage.removeChildren()
    this.elementMap = new Map()
  }
  private setupElement(id: string, element: IStageElement) {
    const { parentId } = this.schemaNodeService.find(id)
    if (!element.parent) {
      const parent = this.find(parentId) || this.pixiService.stage
      element.setParent(parent)
    }
    element.eventMode = 'dynamic'
    element.on('mouseenter', () => this.schemaNodeService.hover(id))
    element.on('mouseleave', () => this.schemaNodeService.unHover(id))
  }
}

export const injectStageElement = inject(StageElementService)
