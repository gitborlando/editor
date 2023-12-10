import { makeObservable, observable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { Watch, When, autobind } from '~/editor/helper/decorator'
import { XY } from '../math/xy'

@autobind
@injectable()
export class MenuService {
  @observable ref?: HTMLDivElement
  @observable show = false
  @observable xy = new XY(0, 0)
  @observable size = { width: 0, height: 0 }
  constructor() {
    makeObservable(this)
    this.autoPosition()
    this.autoHideMenu()
  }
  setRef(div: HTMLDivElement) {
    this.ref = div
  }
  setShow(show: boolean) {
    this.show = show
  }
  setXY(x: number, y: number) {
    this.xy = XY.Of(x, y)
  }
  @Watch('xy')
  @When('!!ref')
  private autoPosition() {
    if (!this.ref) return
    const { width, height } = this.ref.getBoundingClientRect()
    this.size = { width, height }
    if (this.xy.y + height > window.innerHeight) {
      this.xy.y -= height
    }
    this.ref.style.left = this.xy.x + 'px'
    this.ref.style.top = this.xy.y + 'px'
  }
  @Watch('show')
  private autoHideMenu() {
    if (!this.show) return
    const hideMenu = (e: MouseEvent) => {
      let dom = document.elementFromPoint(e.clientX, e.clientY)
      if (dom?.className.match('Menu')) return
      while (dom?.parentElement && (dom = dom.parentElement)) {
        if (dom.className.match('Menu')) return
      }
      this.setShow(false)
      window.removeEventListener('mousedown', hideMenu, { capture: true })
    }
    window.addEventListener('mousedown', hideMenu, { capture: true })
  }
}

export const injectMenu = inject(MenuService)
