import { delay, inject, injectable } from 'tsyringe'
import { autobind } from '~/helper/decorator'
import { PIXI, PixiService, injectPixi } from '../pixi'

export type IPixiShape = PIXI.Graphics | PIXI.Text

@autobind
@injectable()
export class StageShapeService {
  shapeMap: Map<string, IPixiShape> = new Map()
  constructor(@injectPixi private pixiService: PixiService) {}
  add(id: string, shape: IPixiShape) {
    this.shapeMap.set(id, shape)
  }
  find(id: string) {
    return this.shapeMap.get(id)
  }
  clearAll() {
    this.pixiService.stage.removeChildren()
    this.shapeMap = new Map()
  }
}

export const injectStageShape = inject(StageShapeService)
export const delayInjectStageShape = inject(delay(() => StageShapeService))
