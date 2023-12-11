import { autobind } from '~/shared/decorator'

@autobind
export class OptimizeUntracked {
  cache = new Map<string, any>()
  constructor() {}
}
