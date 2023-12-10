import { autobind } from '~/editor/helper/decorator'

@autobind
export class OptimizeCache {
  cache = new Map<string, any>()
  constructor() {}
  set(id: string, value: any) {
    this.cache.set(id, value)
  }
  get<T>(id: string) {
    return this.cache.get(id) as T
  }
  getSet<T>(id: string, fn: () => T) {
    let value = this.cache.get(id)
    if (value) return value as T
    value = fn()
    this.cache.set(id, value)
    return value
  }
  depose() {
    this.cache.clear()
  }
}
