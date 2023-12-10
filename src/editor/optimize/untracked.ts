import { autobind } from '~/editor/helper/decorator'

@autobind
export class OptimizeUntracked {
  cache = new Map<string, any>()
  constructor() {}
}
