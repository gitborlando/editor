import { makeObservable, observable } from 'mobx'
import { autobind } from '~/shared/decorator'

@autobind
class SharedStateService {
  private initialized = false
  @observable show = true
  @observable type = <'color' | 'linear' | 'photo'>'color'
  constructor() {
    makeObservable(this)
  }
  init() {
    if (this.initialized) return
    this.initialized = true
  }
  setShow(show: boolean) {
    this.show = show
  }
  setType(type: typeof this.type) {
    this.type = type
  }
}

export const pickerShareState = new SharedStateService()
