import autobind from 'class-autobind-decorator'
import { createSignal } from '~/shared/signal/signal'
import { xy_new } from '../math/xy'
import { Pixi } from './pixi'

export type IStageCursorType = 'auto' | 'h-resize' | 'v-resize' | 'se-resize' | 'sw-resize'

@autobind
class StageCursorService {
  type = createSignal(<IStageCursorType>'auto')
  xy = createSignal(xy_new(0, 0))
  rotation = createSignal(0)
  initHook() {
    this.type.hook(this.autoChange)
  }
  private autoChange() {
    Pixi.htmlContainer.style.cursor = (<const>{
      auto: 'auto',
      'h-resize': 'e-resize',
      'v-resize': 's-resize',
      'se-resize': 'se-resize',
      'sw-resize': 'sw-resize',
    })[this.type.value]
  }
}

export const StageCursor = new StageCursorService()
