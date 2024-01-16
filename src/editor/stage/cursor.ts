import autobind from 'class-autobind-decorator'
import { createSignal } from '~/shared/signal'
import { xy_new } from '../math/xy'
import { Pixi } from './pixi'

export type IStageCursorType = 'select' | 'h-resize' | 'v-resize'

@autobind
export class StageCursorService {
  type = createSignal(<IStageCursorType>'select')
  xy = createSignal(xy_new(0, 0))
  rotation = createSignal(0)
  initHook() {
    this.type.hook(this.autoChange)
  }
  private autoChange() {
    Pixi.container.style.cursor = (<const>{
      select: 'auto',
      'h-resize': 'e-resize',
      'v-resize': 's-resize',
    })[this.type.value]
  }
}

export const StageCursor = new StageCursorService()
