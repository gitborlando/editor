import { autobind } from '~/shared/decorator'

type IMultiCacheName = 'draw-path' | (string & {})

const multiCacheMap = new Map<string, MultiCache>()

@autobind
export class MultiCache {
  cache = new Map<string, any>()
  constructor(public readonly name: string) {}
  get<T>(id: string) {
    return this.cache.get(id) as T
  }
  set<T>(id: string, value: T) {
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
  depose() {
    this.cache.clear()
  }
  static GetOrNew(cacheName: IMultiCacheName): MultiCache {
    let cache = multiCacheMap.get(cacheName)
    if (cache) return cache
    cache = new MultiCache(cacheName)
    multiCacheMap.set(cacheName, cache)
    return cache
  }
}
