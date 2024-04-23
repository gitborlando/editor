import autobind from 'class-autobind-decorator'
import { xy_new } from '~/editor/math/xy'
import { createSignal } from '~/shared/signal'
import { addListenerCapture, clickAway } from '~/shared/utils/event'
import { IAnyFunc, IAnyObject, INoopFunc } from '~/shared/utils/normal'
import { menuConfig } from './config'

export type IMenuItem = {
  label: string
  callback: IAnyFunc
  shortcut?: string
  children?: IMenuItem[][]
}

@autobind
export class MenuService {
  menuOptions = createSignal<IMenuItem[][]>([])
  xy = createSignal(xy_new(0, 0))
  context = <IAnyObject>{}
  readonly menuConfig = menuConfig
  private ref?: HTMLDivElement
  private disposers = <INoopFunc[]>[]
  initHook() {}
  setRef(div: HTMLDivElement) {
    this.ref = div
    this.disposers.forEach((dispose) => dispose())
    this.disposers.push(this.autoHideMenu(div), addListenerCapture('mousedown', this.autoPosition))
  }
  closeMenu() {
    this.menuOptions.dispatch([])
    this.context = {}
  }
  private autoPosition(e: MouseEvent) {
    if (!this.ref) return
    this.xy.value = xy_new(e.clientX, e.clientY)
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
