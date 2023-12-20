import { inject, injectable } from 'tsyringe'
import { autobind } from '~/shared/decorator'
import { createHooker } from '~/shared/hooker'

@autobind
@injectable()
export class LoopService {
  firstStage = createHooker()
  secondStage = createHooker()
  thirdStage = createHooker()
  constructor() {
    requestAnimationFrame(this.loop)
  }
  private loop() {
    this.firstStage.dispatch()
    this.secondStage.dispatch()
    this.thirdStage.dispatch()
    requestAnimationFrame(this.loop)
  }
}

export const injectLoop = inject(LoopService)
