import autobind from 'class-autobind-decorator'
import { IEditorCommand } from 'src/editor/editor/command'
import { xy_, xy_client } from 'src/editor/math/xy'
import { createSignal } from 'src/shared/signal/signal'
import { clickAway, listenCapture } from 'src/shared/utils/event'
import { IAnyObject } from 'src/shared/utils/normal'

@autobind
class MenuService {
  menuOptions = createSignal<IEditorCommand[][]>([])
  xy = createSignal(xy_(0, 0))
  context = <IAnyObject>{}

  private ref?: HTMLDivElement

  setRef(div: HTMLDivElement) {
    if (this.ref) return
    this.ref = div

    this.autoHideMenu(div)
    listenCapture('mousedown', this.autoPosition)
  }

  closeMenu() {
    this.menuOptions.dispatch([])
    this.context = {}
  }

  private autoPosition(e: MouseEvent) {
    if (!this.ref) return

    this.xy.value = xy_client(e)
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
