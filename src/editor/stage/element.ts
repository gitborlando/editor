import { inject, injectable } from 'tsyringe'
import { autobind } from '~/editor/utility/decorator'
import { PIXI, PixiService, injectPixi } from './pixi'

export type IStageElement = PIXI.Graphics | PIXI.Text

@autobind
@injectable()
export class StageElementService {
  private elementMap: Map<string, IStageElement> = new Map()
  constructor(@injectPixi private pixiService: PixiService) {}
  add(id: string, element: IStageElement) {
    this.elementMap.set(id, element)
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
}

export const injectStageElement = inject(StageElementService)
