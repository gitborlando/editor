import { makeObservable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { autobind } from '~/helper/decorator'

@autobind
@injectable()
export class LPanelPageService {
  constructor /** @inject private Service: Service **/() {
    makeObservable(this)
  }
}

export const injectLPanelPage = inject(LPanelPageService)
