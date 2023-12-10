import { autobind } from '~/editor/helper/decorator'

type IOptimizeCacheName = 'drawPathCache'

const optimizeCacheMap = new Map<string, OptimizeCache>()

@autobind
export class OptimizeCache {
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
  static GetOrNew(cacheName: IOptimizeCacheName): OptimizeCache {
    let cache = optimizeCacheMap.get(cacheName)
    if (cache) return cache
    cache = new OptimizeCache(cacheName)
    optimizeCacheMap.set(cacheName, cache)
    return cache
  }
}
