import { makeAutoObservable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { autobind } from '~/shared/decorator'

type IStateKey = keyof Omit<
  StatusService,
  'thisAsAny' | 'enter' | 'leave' | 'true' | 'false' | 'toggle' | 'set' | 'emit'
>

@autobind
@injectable()
export class StatusService {
  pageFirstRender = false

  thisAsAny: any
  constructor() {
    makeAutoObservable(this, { thisAsAny: false })
    this.thisAsAny = this
  }
  enter(key: IStateKey) {
    this.thisAsAny[key] = true
  }
  leave(key: IStateKey) {
    this.thisAsAny[key] = false
  }
  true(key: IStateKey) {
    this.thisAsAny[key] = true
  }
  false(key: IStateKey) {
    this.thisAsAny[key] = false
  }
  toggle(key: IStateKey) {
    this.thisAsAny[key] = !this.thisAsAny[key]
  }
  set(key: IStateKey, value: any) {
    this.thisAsAny[key] = value
  }
}

export const injectStatus = inject(StatusService)
