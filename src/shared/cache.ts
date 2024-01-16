import autobind from 'class-autobind-decorator'

@autobind
export class Cache<T> {
  cache = new Map<string, any>()
  get(id: string) {
    return this.cache.get(id) as T
  }
  set(id: string, value: T) {
    this.cache.set(id, value)
    return value
  }
  delete(id: string) {
    this.cache.delete(id)
  }
  getSet<T>(id: string, fn: () => T) {
    let value = this.cache.get(id)
    if (value) return value as T
    value = fn()
    this.cache.set(id, value)
    return value as T
  }
  clear() {
    this.cache.clear()
  }
}

export function createCache<T extends any>() {
  return new Cache<T>()
}
