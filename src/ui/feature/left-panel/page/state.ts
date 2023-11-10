import autoBind from 'auto-bind'
import { makeAutoObservable } from 'mobx'

export class PageCompShareState {
  collapsed = false
  constructor() {
    autoBind(this)
    makeAutoObservable(this)
  }
  setCollapsed(collapsed: boolean) {
    this.collapsed = collapsed
    return this
  }
}

export const pageCompShareState = new PageCompShareState()
