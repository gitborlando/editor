import autobind from 'class-autobind-decorator'
import { IEditorCommand } from '~/editor/editor/command'
import { xy_ } from '~/editor/math/xy'
import { createSignal } from '~/shared/signal/signal'
import { addListenerCapture, clickAway } from '~/shared/utils/event'
import { IAnyObject } from '~/shared/utils/normal'

@autobind
class MenuService {
  menuOptions = createSignal<IEditorCommand[][]>([])
  xy = createSignal(xy_(0, 0))
  context = <IAnyObject>{}
  private ref?: HTMLDivElement
  initHook() {}
  setRef(div: HTMLDivElement) {
    if (this.ref) return
    this.ref = div
    this.autoHideMenu(div)
    addListenerCapture('mousedown', this.autoPosition)
  }
  closeMenu() {
    this.menuOptions.dispatch([])
    this.context = {}
  }
  private autoPosition(e: MouseEvent) {
    if (!this.ref) return
    this.xy.value = xy_(e.clientX, e.clientY)
    const { width, height } = this.ref.getBoundingClientRect()
    if (this.xy.value.y + height > window.innerHeight) {
      this.xy.value.y -= height
    }
    this.xy.dispatch()
  }
  private autoHideMenu(menuDom: HTMLDivElement) {
    return clickAway({
      when: () => this.menuOptions.value.length > 0,
      insideTest: (dom) => dom === menuDom,
      callback: () => this.menuOptions.dispatch([]),
    })
  }
}

export const Menu = new MenuService()
