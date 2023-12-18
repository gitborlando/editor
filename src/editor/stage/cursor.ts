import { makeObservable, observable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { WatchNext, autobind } from '~/shared/decorator'
import { IXY } from '~/shared/utils'
import { xy_new } from '../math/xy'
import { PixiService, injectPixi } from './pixi'

export type IStageCursorType = 'select' | 'h-resize' | 'v-resize'

@autobind
@injectable()
export class StageCursorService {
  @observable type = <IStageCursorType>'select'
  @observable xy = xy_new(0, 0)
  @observable rotation = 0
  constructor(@injectPixi private Pixi: PixiService) {
    makeObservable(this)
    this.autoChange()
  }
  setType(type: IStageCursorType) {
    this.type = type
  }
  setXy(xy: IXY) {
    this.xy = xy
  }
  setRotation(rotation: number) {
    this.rotation = rotation
  }
  @WatchNext('type')
  private autoChange() {
    this.Pixi.container.style.cursor = (<const>{
      select: 'auto',
      'h-resize': 'e-resize',
      'v-resize': 's-resize',
    })[this.type]
  }
}

export const injectStageCursor = inject(StageCursorService)
