import { makeObservable, observable } from 'mobx'
import { autobind } from '~/shared/decorator'

@autobind
class SharedStateService {
  private initialized = false
  @observable type = <'operate' | 'development'>'operate'
  constructor() {
    makeObservable(this)
  }
  init() {
    if (this.initialized) return
    this.initialized = true
  }
}

export const rightPanelShareState = new SharedStateService()
