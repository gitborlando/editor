import { autobind } from '../decorator'
import { Hooker, hookerMap } from './hooker'

@autobind
export class WatchHooker<T extends any[]> extends Hooker<T> {
  private news: T = [] as unknown as T
  private olds: T = [] as unknown as T
  constructor(news?: T) {
    super()
    this.news = news || this.news
  }
  dispatch(...args: T) {
    this.olds = this.news
    this.news = args
    hookerMap.get(this)?.forEach((hook) => hook?.(...args))
  }
  get(type: 'newValues'): T
  get(type: 'allValues'): { new: T; old: T }
  get(type: 'current' | 'newValues' | 'allValues' = 'current') {
    if (type === 'newValues') return this.news
    if (type === 'allValues') return { new: this.news, old: this.olds }
    return this.news
  }
}

export function createWatchHooker<T extends any[]>(news?: T) {
  return new WatchHooker<T>(news)
}
