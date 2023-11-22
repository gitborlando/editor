import { autoBind } from '~/helper/decorator'
import { PIXI, PixiService } from '../pixi'

export type IPixiShape = PIXI.Graphics | PIXI.Text

@autoBind
export class StageShapeService {
  shapeMap: Map<string, IPixiShape> = new Map()
  constructor(private pixiService: PixiService) {}
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
