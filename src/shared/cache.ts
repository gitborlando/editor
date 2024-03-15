import autobind from 'class-autobind-decorator'

@autobind
export class Cache<K, V> {
  cache = new Map<K, V>()
  get(key: K) {
    return this.cache.get(key) as V
  }
  set(key: K, value: V) {
    this.cache.set(key, value)
    return value
  }
  delete(key: K) {
    this.cache.delete(key)
  }
  getSet(key: K, fn: () => V) {
    let value = this.cache.get(key)
    if (value !== undefined) return value
    value = fn()
    this.cache.set(key, value)
    return value
  }
  clear() {
    this.cache.clear()
  }
  forEach(callback: (key: K, value: V, map: Map<K, V>) => void) {
    this.cache.forEach((v, k, m) => callback(k, v, m))
  }
  keys() {
    return this.cache.keys()
  }
  values() {
    return this.cache.values()
  }
  fromObject(obj: Record<string | number | symbol, V>) {
    this.cache = new Map(Object.entries(obj)) as Map<K, V>
  }
  toObject() {
    return Object.fromEntries(
      [...this.cache.entries()].map(([key, value]) => [key, value])
    ) as Record<string | number | symbol, V>
  }
}

export function createCache<V extends any, K extends any = string>() {
  return new Cache<K, V>()
}
