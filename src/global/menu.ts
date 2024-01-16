import autobind from 'class-autobind-decorator'
import { makeObservable, observable } from 'mobx'
import { XY } from '~/shared/structure/xy'

@autobind
export class MenuService {
  @observable ref?: HTMLDivElement
  @observable show = false
  @observable xy = new XY(0, 0)
  @observable size = { width: 0, height: 0 }
  constructor() {
    makeObservable(this)
    this.autoPosition()
    window.addEventListener('mousedown', this.hideMenu, { capture: true })
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
  // @Watch('xy')
  // @When('!!ref')
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
  private hideMenu(e: MouseEvent) {
    if (!this.show) return
    let dom = document.elementFromPoint(e.clientX, e.clientY)
    while (dom) {
      if (dom.className.match('Menu')) return
      dom = dom.parentElement
    }
    this.setShow(false)
  }
}

export const Menu = new MenuService()
